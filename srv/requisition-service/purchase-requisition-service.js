const cds = require("@sap/cds");
const { text } = require("stream/consumers");

module.exports = (srv) => {
  const {
    PurchaseRequisition,
    MaterialMaster,
    Plant,
    StorageLocations,
    PurchasingGroups,
    PurchasingDocumentTypes,
    PurchasingInfoRecord,
    PurchaseRequisitionAccountAssignment,
  } = srv.entities;

  const BUDGET_LIMIT = 500000;

  const validateMandatoryFields = async (data, req) => {
    const mandatoryFields = [
      "material_material",
      "plant_plant",
      "quantity",
      "deliveryDate",
      "PurchasingGroup_purchasingGroup",
    ];

    const missing = mandatoryFields.filter(
      (field) =>
        data[field] === undefined || data[field] === null || data[field] === ""
    );

    if (missing.length > 0) {
      req.error(
        `Missing mandatory fields in ${missing}: ${missing.join(", ")}`
      );
    }

    return null;
  };

  const validateMaterial = async (data, tx, req) => {
    const { material_material, purchasingInfoRecords } = data;

    try {
      // Validate EBAN.Material → MARA.Material
      if (material_material) {
        const materialExists = await tx.run(
          SELECT.one.from(MaterialMaster).where({ material: material_material })
        );

        if (!materialExists) {
          req.error(
            400,
            `Material '${material_material}' in EBAN not found in Material Master (MARA)`
          );
          return;
        }
      }

      // Validate EINA.Material → MARA.Material
      if (purchasingInfoRecords && purchasingInfoRecords.length > 0) {
        for (const pir of purchasingInfoRecords) {
          const { material_material: einaMaterial } = pir;

          if (einaMaterial) {
            const einaMaterialExists = await tx.run(
              SELECT.one.from(MaterialMaster).where({ material: einaMaterial })
            );

            if (!einaMaterialExists) {
              req.error(
                400,
                `Material '${einaMaterial}' in Purchasing Info Record (EINA) not found in Material Master (MARA)`
              );
              return;
            }
          }
        }
      }
      return true;
    } catch (error) {
      req.error(
        500,
        `Error validating material: ${error.message}`,
        "MATERIAL_VALIDATION_ERROR"
      );
    }
  };

  const validatePlant = async (data, tx, req) => {
    if (!data.plant_plant) return true;

    try {
      const plantExists = await tx.run(
        SELECT.one.from(Plant).where({ plant: data.plant_plant })
      );

      if (!plantExists) {
        req.error(
          400,
          `Plant of EBAN ${data.plant_plant} not found in Plant/Branches`
        );
      }
    } catch (error) {
      req.error(
        500,
        `Error validating Plant: ${error.message}`,
        "PLANT_VALIDATION_ERROR"
      );
    }
  };

  const validateStorageLocation = async (data, tx, req) => {
    if (!data.storageLocation) return true;

    try {
      const storageLocationExists = tx.run(
        SELECT.one
          .from(StorageLocations)
          .where({ storageLocation: data.StorageLocation })
      );
      if (!storageLocationExists) {
        req.error(
          400,
          `Storage locations from EBAN ${data.storageLocation} not found in Storage Locations`
        );
      }
    } catch (error) {
      req.error(
        500,
        `Error validating Storage Location: ${error.message}`,
        "STORAGE_LOCATIONS_VALIDATION_ERROR"
      );
    }
  };

  const validatePurchasingGroups = async (data, tx, req) => {
    if (!data.PurchasingGroup_purchasingGroup) return true;

    try {
      const purchasingGroup = await tx.run(
        SELECT.one
          .from(PurchasingGroups)
          .where({ purchasingGroup: data.PurchasingGroup_purchasingGroup })
      );
      if (!purchasingGroup) {
        req.error(
          400,
          `Purchasing Group ${data.PurchasingGroup_purchasingGroup} not found in Purchasing Groups`
        );
      }
    } catch (error) {
      req.error(500, `Error validating Purchasing Groups: ${error.message}`);
    }
  };

  const validatePurchaseRequisitionType = async (data, tx, req) => {
    const { purchaseRequisitionType } = data;
    if (!purchaseRequisitionType) return true;

    try {
      const prType = await tx.run(
        SELECT.one.from(PurchasingDocumentTypes).where({
          documentType: purchaseRequisitionType,
        })
      );

      if (!prType) {
        req.error(
          400,
          `Purchase Requisition Type '${purchaseRequisitionType}' does not exist in PurchasingDocumentTypes`
        );
        return;
      }

      // Optional: Validate that the category is 'B' if needed
      if (prType.documentCategory !== "B") {
        req.error(
          400,
          `Document Type '${purchaseRequisitionType}' is not valid for Purchase Requisitions (expected category 'B', got '${prType.documentCategory}')`
        );
        return;
      }

      return true;
    } catch (error) {
      req.error(
        500,
        `Error validating Purchase Requisition Type: ${error.message}`
      );
    }
  };

  const validateSupplierFromPurchasingInfoRecord = async (data, tx, req) => {
    const { purchasingInfoRecords } = data;
    if (!purchasingInfoRecords) return true;

    try {
      for (const pir of purchasingInfoRecords) {
        const { supplier_supplier } = pir;

        const supplierExists = await tx.run(
          SELECT.one
            .from("master.table.VendorMaster")
            .where({ supplier: supplier_supplier })
        );

        if (!supplierExists) {
          req.error(
            400,
            `Supplier '${supplier_supplier}' referenced in Purchasing Info Record does not exist in Vendor Master (LFA1)`
          );
          return;
        }
      }

      return true;
    } catch (error) {
      req.error(500, `Error validating supplier: ${error.message}`);
    }
  };

  const validateDataFormat = (data, context = "") => {
    if (
      data.quantity !== undefined &&
      (isNaN(data.quantity) || data.quantity <= 0)
    ) {
      return `Quantity must be a positive decimal, got ${data.quantity} (${context})`;
    }

    if (data.deliveryDate) {
      try {
        const today = new Date();
        const deliveryDateObj = new Date(data.deliveryDate);

        if (isNaN(deliveryDateObj.getTime())) {
          return `Invalid delivery date format: '${data.deliveryDate}' (${context})`;
        }

        // Remove time part for accurate date-only comparison
        today.setHours(0, 0, 0, 0);
        deliveryDateObj.setHours(0, 0, 0, 0);

        if (deliveryDateObj < today) {
          return `Delivery Date (${
            deliveryDateObj.toISOString().split("T")[0]
          }) must be today or a future date (≥ ${
            today.toISOString().split("T")[0]
          }) (${context})`;
        }
      } catch (error) {
        return `Error validating delivery date: ${error.message} (${context})`;
      }
    }

    return null;
  };

  const validatePurchasingLimit = async (data, context = "") => {
    const quantity = data.quantity;
    const purchasingInfoRecords = data.purchasingInfoRecords;

    if (!quantity || quantity <= 0) {
      return `Invalid quantity: ${quantity} (${context})`;
    }

    if (!purchasingInfoRecords || purchasingInfoRecords.length === 0) {
      return `Missing Purchasing Info Record data (${context})`;
    }

    try {
      const pir = purchasingInfoRecords[0]; // Assuming one PIR per item
      const orgData = pir.purchasingOrgData?.[0];

      if (!orgData) {
        return `No purchasing organization data found for InfoRecord '${pir.purchasingInfoRecord}' (${context})`;
      }

      if (orgData.netPrice == null || orgData.priceUnit == null) {
        return `No pricing found for InfoRecord '${pir.purchasingInfoRecord}' and Org '${orgData.purchasingOrganization}' (${context})`;
      }

      const netPrice = parseFloat(orgData.netPrice);
      const priceUnit = parseFloat(orgData.priceUnit || 1);
      const effectivePrice = netPrice / priceUnit;
      const totalValue = effectivePrice * quantity;

      if (totalValue > BUDGET_LIMIT) {
        return `Total value (${totalValue.toFixed(
          2
        )} AUD) exceeds budget (${BUDGET_LIMIT.toLocaleString()} AUD) (${context})`;
      }

      return null;
    } catch (error) {
      return `Error validating purchasing limit: ${error.message} (${context})`;
    }
  };

  const runValidations = async (data, tx, req, context = "") => {
    const validationPromises = [
      {
        name: "purchasingLimit",
        fn: validatePurchasingLimit(data, context),
      },
      {
        name: "mandatoryFields",
        fn: validateMandatoryFields(data, req),
      },
      { name: "material", fn: validateMaterial(data, req) },
      { name: "plant", fn: validatePlant(data, req) },
      {
        name: "purchaseRequisitionType",
        fn: validatePurchaseRequisitionType(data, req),
      },
      { name: "purchasingGroups", fn: validatePurchasingGroups(data, req) },
      { name: "storageLocation", fn: validateStorageLocation(data, req) },
      {
        name: "supplier",
        fn: validateSupplierFromPurchasingInfoRecord(data, req),
      },
    ];

    const results = await Promise.allSettled(
      validationPromises.map((v) => v.fn)
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Validation ${validationPromises[index].name} failed`,
          result.reason
        );
      }
    });

    const allValid = results.every(
      (result) => result.status === "fulfilled" && result.value === true
    );

    if (!allValid) throw new Error("Validation failed");
  };

  srv.before("UPDATE", PurchaseRequisition, async (req) => {
    const tx = cds.transaction(req);
    const { purchaseRequisition, purchaseReqnItem } = req.data;
    const data = {
      ...req.data,
      storageLocation_storageLocation:
        req.data.storageLocation || req.data.storageLocation_storageLocation,
    };

    try {
      const existingPR = await tx.run(
        SELECT.one
          .from(PurchaseRequisition)
          .where({ purchaseRequisition, purchaseReqnItem })
      );

      if (!existingPR) {
        req.error(
          404,
          `Purchase Requisition ${purchaseRequisition}/${purchaseReqnItem} not found`
        );
        return;
      }

      const formatError = validateDataFormat(data, "UPDATE");
      if (formatError) {
        req.error(400, formatError);
        return;
      }
      await runValidations(data, tx, req, "UPDATE");
    } catch (error) {
      req.error(500, `Validation error: ${error.message}`);
      return false;
    }
  });

  async function nextPRNumber(tx) {
    const last = await tx.run(
      SELECT.one
        .from(PurchaseRequisition)
        .orderBy({ purchaseRequisition: "desc" })
    );
    const lastNo = last?.purchaseRequisition || "1000000000";
    const nextNo = String(parseInt(lastNo, 10) + 1).padStart(10, "0");

    return nextNo;
  }

    // Use this handler for validation and generating the final ID before saving.
    srv.before("CREATE", PurchaseRequisition, async (req) => {
      console.log("Creating a permanent PurchaseRequisition.");
      const tx = cds.transaction(req);
      const { data } = req;
  
      // Only provide number if missing (in case NEW doesn't work)
      if (!data.purchaseRequisition) {
        data.purchaseRequisition = await nextPRNumber(tx);
      }
      if (!data.purchaseReqnItem) {
        data.purchaseReqnItem = "00010";
      }
  

  
      // Fetch supplier from PurchasingInfoRecord
      const infoRecord = await tx.run(
        SELECT.one
          .from(PurchasingInfoRecord)
          .where({ material_material: material.material_material })
      );
      if (!infoRecord) {
        return req.error(
          400,
          "No Purchasing Info Record found for the selected material."
        );
      }
  
      // Enrich data
      data.createdByUser = req.user?.id || requisitioner;
      data.supplier_supplier = infoRecord.supplier_supplier;
  
      // Add account assignment, using the new keys
      data.accountAssignment = [
        {
          purchaseRequisition: data.purchaseRequisition, // Use the newly generated ID
          purchaseReqnItem: data.purchaseReqnItem, // Use the newly generated item
          acctAssignment: "01",
          acctAssignmentCategory: "K",
          glAccount: "400000",
          costCenter: "CC001",
          order: "ORD001",
        },
      ];
  
      if (infoRecord.netPrice) {
        data.netPrice = infoRecord.netPrice;
      }

    });

  srv.before("NEW", PurchaseRequisition.drafts, async (req) => {
    const tx = cds.transaction(req);
    req.data.purchaseRequisition = await nextPRNumber(tx);
    req.data.purchaseReqnItem = "00010"; // maybe the purchase Reqn item always 00010 right?

    req.data.requisitionDate = new Date().toISOString().split("T")[0];
    req.data.releaseStatus = "Pending";
    req.data.PurchaseRequisitionType = "NB";
    req.data.baseUnit = "EA";
    return req.data;
  });



  // Bound actions with visibility checks
  srv.before("approve", PurchaseRequisition, async (req) => {
    const tx = cds.transaction(req);
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];

    if (!purchaseRequisition || !purchaseReqnItem)
      return req.error(400, "Missing PR keys");

    const pr = await tx.run(
      SELECT.one
        .from(PurchaseRequisition)
        .where({ purchaseRequisition, purchaseReqnItem, IsActiveEntity: true })
    );

    if (!pr) {
      req.error(
        404,
        `Purchase Requisition ${purchaseRequisition}/${purchaseReqnItem} not found`
      );
      return;
    }

    if (pr.releaseStatus === "REL") {
      return req.error(400, "PR already released");
    }
    if (pr.releaseStatus && pr.releaseStatus !== "NOT_REL") {
      return req.error(
        400,
        `Approve not allowed from status ${pr.releaseStatus}`
      );
    }
    try {
      await runValidations(pr, tx, req, "APPROVE");
    } catch (error) {
      req.error(400, error.message);
    }
  });

  srv.on("approve", PurchaseRequisition, async (req) => {
    const tx = cds.transaction(req);
    const { purchaseRequisition, purchaseReqnItem } = req.params[0] || {};

    const updated = await tx.run(
      UPDATE(PurchaseRequisition)
        .set({
          releaseStatus: "REL",
          releasedBy: req.user?.id || "SYSTEM",
          releasedAt: new Date(),
        })
        .where({
          purchaseRequisition,
          purchaseReqnItem,
          IsActiveEntity: true,
          releaseStatus: "NOT_REL",
        })
    );
    if (updated !== 1) {
      return req.error(409, "PR status changed by someone else");
    }

    return true;
  });
  // Only allow edits before release
  srv.before("PATCH", PurchaseRequisition, async (req) => {
    const tx = cds.transaction(req);
    const keys = {
      purchaseRequisition: req.data.purchaseRequisition,
      purchaseReqnItem: req.data.purchaseReqnItem,
    };
    if (!keys.purchaseRequisition || !keys.purchaseReqnItem) return;

    const cur = await tx.run(
      SELECT.one
        .from(PurchaseRequisition)
        .columns("releaseStatus")
        .where({ ...keys, IsActiveEntity: true })
    );
    if (cur?.releaseStatus === "REL") {
      //released: prohibits changing main business fields
      const blocked = [
        "quantity",
        "deliveryDate",
        "material",
        "plant",
        "storageLocation",
        "PurchasingGroup",
        "accountAssignment",
      ];
      const tried = Object.keys(req.data).filter((k) => blocked.includes(k));
      if (tried.length)
        return req.error(
          400,
          `PR released; cannot modify: ${tried.join(", ")}`
        );
    }
  });

  srv.before("rejectOrder", PurchaseRequisition.drafts, async (req) => {
    const tx = cds.transaction(req);
    const { purchaseRequisition, purchaseReqnItem } = req.params[0] || {};
    const { rejectReason } = req.data || {};

    if (!purchaseRequisition || !purchaseReqnItem)
      return req.error(400, "Missing PR keys");
    if (!rejectReason || !rejectReason.trim())
      return req.error(400, "Rejection reason is required");
    if (rejectReason.length > 255)
      return req.error(400, "Reason too long (max 255)");

    const pr = await tx.run(
      SELECT.one
        .from(PurchaseRequisition)
        .columns("releaseStatus")
        .where({ purchaseRequisition, purchaseReqnItem})
    );
    if (!pr)
      return req.error(
        404,
        `PR ${purchaseRequisition}/${purchaseReqnItem} not found`
      );
    if (pr.releaseStatus === "REL")
      return req.error(400, "Cannot reject a released PR");
    if (pr.releaseStatus && pr.releaseStatus !== "NOT_REL")
      return req.error(
        400,
        `Reject not allowed from status ${pr.releaseStatus}`
      );
  });

  srv.on("rejectOrder", PurchaseRequisition.drafts, async (req) => {
    const tx = cds.transaction(req);
    const { purchaseRequisition, purchaseReqnItem } = req.params[0] || {};
    const { rejectReason } = req.data || {};

    const updated = await tx.run(
      UPDATE(PurchaseRequisition)
        .set({
          releaseStatus: "REJ", // keep statuses consistent: NOT_REL | REL | REJ
          rejectReason: rejectReason.trim(),
          rejectedBy: req.user?.id || "SYSTEM", // add these cols if you created them
          rejectedAt: new Date(),
        })
        .where({
          purchaseRequisition,
          purchaseReqnItem,
          IsActiveEntity: true,
          releaseStatus: "NOT_REL", // CAS guard
        })
    );
    if (updated !== 1)
      return req.error(409, "PR status changed by someone else");

    return tx.run(
      SELECT.one
        .from(PurchaseRequisition)
        .where({ purchaseRequisition, purchaseReqnItem, IsActiveEntity: true })
    );
  });
};
