const cds = require("@sap/cds");

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

  const ALLOWED_RELEASE_STATUSES = [
    "Pending",
    "Approved",
    "Rejected",
    "Released",
    "REL",
    "Cancelled",
  ];

  function validateMandatoryFields(data, context = "") {
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
      return `Missing mandatory fields in ${context}: ${missing.join(", ")}`;
    }

    return null;
  }

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

  async function validateForeignKeys(tx, data, context = "") {
    if (data.material_material) {
      const material = await tx.run(
        SELECT.one
          .from(MaterialMaster)
          .where({ material: data.material_material })
      );
      if (!material) {
        return `Material ${data.material_material} does not exist (${context})`;
      }
    }

    if (data.plant_plant) {
      const plant = await tx.run(
        SELECT.one.from(Plant).where({ plant: data.plant_plant })
      );
      if (!plant) {
        return `Plant ${data.plant_plant} does not exist (${context})`;
      }
    }

    if (
      data.releaseStatus &&
      !ALLOWED_RELEASE_STATUSES.includes(data.releaseStatus)
    ) {
      return `Invalid releaseStatus '${
        data.releaseStatus
      }'. Allowed values: ${ALLOWED_RELEASE_STATUSES.join(", ")} (${context})`;
    }

    return null;
  }

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
          return `Delivery Date (${deliveryDateObj.toISOString().split("T")[0]}) must be today or a future date (≥ ${today.toISOString().split("T")[0]}) (${context})`;
        }
      } catch (error) {
        return `Error validating delivery date: ${error.message} (${context})`;
      }
    }
    

    return null;
  };

  const validatePurchasingLimit = async (data, existingPR, context = "") => {
    const quantity = data.quantity ?? existingPR?.quantity;
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

  srv.before("UPDATE", PurchaseRequisition, async (req) => {
    const tx = cds.transaction(req);
    const { purchaseRequisition, purchaseReqnItem } = req.data;
    const data = {
      ...req.data,
      storageLocation_storageLocation:
        req.data.storageLocation || req.data.storageLocation_storageLocation,
    };
    delete data.accountAssignment;

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
      const validationPromises = [
        {
          name: "purchasingLimit",
          fn: validatePurchasingLimit(data, existingPR, "UPDATE"),
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

      return results.every(
        (result) => result.status === "fulfilled" && result.value === true
      );
    } catch (error) {
      req.error(500, `Validation error: ${error.message}`);
      return false;
    }
  });

  srv.on("CREATE", async (req) => {
    const tx = cds.transaction(req);
    const {
      purchaseRequisition,
      material,
      plant,
      quantity,
      deliveryDate,
      purchasingGroup,
      storageLocation,
    } = req.data;

    const data = {
      purchaseRequisition,
      material_material: material,
      plant_plant: plant,
      quantity,
      deliveryDate,
      PurchasingGroup_purchasingGroup: purchasingGroup,
      storageLocation_storageLocation: storageLocation,
      releaseStatus: "Pending",
    };

    const mandatoryError = validateMandatoryFields(
      data,
      [
        "material_material",
        "plant_plant",
        "quantity",
        "deliveryDate",
        "PurchasingGroup_purchasingGroup",
      ],
      "createPurchaseRequisitionItem"
    );
    if (mandatoryError) {
      req.error(400, mandatoryError);
      return;
    }

    const fkError = await validateForeignKeys(
      tx,
      data,
      "createPurchaseRequisitionItem"
    );
    if (fkError) {
      req.error(400, fkError);
      return;
    }

    const formatError = validateDataFormat(
      data,
      "createPurchaseRequisitionItem"
    );
    if (formatError) {
      req.error(400, formatError);
      return;
    }

    const limitError = await validatePurchasingLimit(
      tx,
      data,
      data,
      "createPurchaseRequisitionItem"
    );
    if (limitError) {
      req.error(400, limitError);
      return;
    }

    const newItem = {
      purchaseRequisition,
      purchaseReqnItem: "00010",
      material_material: material,
      plant_plant: plant,
      storageLocation_storageLocation: storageLocation || null,
      PurchasingGroup_purchasingGroup: purchasingGroup,
      purchaseRequisitionType: "NB",
      quantity,
      deliveryDate,
      baseUnit: "EA",
      requisitioner: "USER1",
      releaseStatus: "Pending",
      requisitionDate: new Date().toISOString().split("T")[0],
      createdByUser: "USER1",
    };

    await tx.run(INSERT.into(PurchaseRequisition).entries(newItem));

    const accountAssignment = {
      purchaseRequisition,
      purchaseReqnItem: "00010",
      acctAssignment: "01",
      acctAssignmentCategory: "K",
      glAccount: "400000",
      costCenter: "CC001",
      order: "ORD001",
    };

    await tx.run(
      INSERT.into(PurchaseRequisitionAccountAssignment).entries(
        accountAssignment
      )
    );

    return tx.run(
      SELECT.one
        .from(PurchaseRequisition)
        .where({ purchaseRequisition, purchaseReqnItem: "00010" })
    );
  });

  // Bound actions with visibility checks
  srv.before("approve", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    const pr = await SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
    if (!pr) {
      req.error(
        404,
        `Purchase Requisition ${purchaseRequisition}/${purchaseReqnItem} not found`
      );
      return;
    }
    if (pr.releaseStatus === "Approved" || pr.releaseStatus === "Rejected") {
      req.error(
        400,
        `Action Approve is not available for releaseStatus: ${pr.releaseStatus}`
      );
    }
  });

  srv.on("approve", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    await UPDATE(PurchaseRequisition)
      .set({ releaseStatus: "Approved" })
      .where({ purchaseRequisition, purchaseReqnItem });
    return SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
  });

  srv.before("rejectOrder", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    const pr = await SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
    if (!pr) {
      req.error(
        404,
        `Purchase Requisition ${purchaseRequisition}/${purchaseReqnItem} not found`
      );
      return;
    }
    if (pr.releaseStatus === "Approved" || pr.releaseStatus === "Rejected") {
      req.error(
        400,
        `Action Reject is not available for releaseStatus: ${pr.releaseStatus}`
      );
    }
  });

  srv.on("rejectOrder", PurchaseRequisition, async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.params[0];
    const { reason } = req.data;
    await UPDATE(PurchaseRequisition)
      .set({ releaseStatus: "Rejected" })
      .where({ purchaseRequisition, purchaseReqnItem });
    return SELECT.one
      .from(PurchaseRequisition)
      .where({ purchaseRequisition, purchaseReqnItem });
  });

  // Ensure Account Assignments are returned with PurchaseRequisition
  srv.after("READ", PurchaseRequisition, async (data, req) => {
    if (Array.isArray(data)) {
      for (const item of data) {
        const accountAssignments = await SELECT.from(
          PurchaseRequisitionAccountAssignment
        ).where({
          purchaseRequisition: item.purchaseRequisition,
          purchaseReqnItem: item.purchaseReqnItem,
        });
        item.accountAssignments = accountAssignments;
      }
    } else if (data) {
      const accountAssignments = await SELECT.from(
        PurchaseRequisitionAccountAssignment
      ).where({
        purchaseRequisition: data.purchaseRequisition,
        purchaseReqnItem: data.purchaseReqnItem,
      });
      data.accountAssignments = accountAssignments;
    }
  });
};
