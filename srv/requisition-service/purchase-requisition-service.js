const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const { PurchaseRequisition } = this.entities;

  this.on("createPurchaseRequisition", async (req) => {
    const { data } = req.data;

    // Generate PR number for each item
    const records = data.map((item, index) => ({
      ...item,
      purchaseRequisition: "PR" + Date.now().toString().slice(-8) + index,
      purchaseReqnItem: item.purchaseReqnItem || "00010",
      requisitionDate: new Date().toISOString().split("T")[0],
      createdByUser: req.user?.id || "SYSTEM",
      releaseStatus: "PENDING",
    }));

    await INSERT.into(PurchaseRequisition).entries(records);

    // Return with expanded associations
    const created = await SELECT.from(PurchaseRequisition)
      .where({
        purchaseRequisition: { in: records.map((r) => r.purchaseRequisition) },
      })
      .columns((q) => {
        (q.purchaseRequisition,
          q.purchaseReqnItem,
          q.material((m) => {
            (m.material, m.materialType);
          }),
          q.plant((p) => {
            (p.plant, p.plantName);
          }),
          q.PurchasingGroup((pg) => {
            (pg.purchasingGroup, pg.purchasingGroupDescription);
          }));
      });

    return created;
  });

  // Before Create - Auto-generate key if needed
  this.before("CREATE", PurchaseRequisition, async (req) => {
    if (!req.data.purchaseRequisition) {
      req.data.purchaseRequisition = "PR" + Date.now().toString().slice(-8);
    }
    if (!req.data.purchaseReqnItem) {
      req.data.purchaseReqnItem = "00010";
    }
  });

  // After Read - Expand associations
  this.on("READ", PurchaseRequisition, async (req) => {
    req.query.SELECT.expand = ["material", "plant", "PurchasingGroup"];
    return cds.run(req.query);
  });

  // Custom Action: Release PR
  this.on("releasePurchaseRequisition", async (req) => {
    const { purchaseRequisition, purchaseReqnItem } = req.data;

    await cds.run(
      UPDATE(PurchaseRequisition)
        .set({ releaseStatus: "Released" })
        .where({ purchaseRequisition, purchaseReqnItem }),
    );

    return true;
  });

  console.log("✅ PurchaseRequisitionService handler loaded");
});
