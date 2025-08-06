const cds = require("@sap/cds");

module.exports = (srv) => {
  const {
    PurchasingInfoRecord,
    PurchasingOrganizationData,
    MaterialInfoRecord,
    MaterialMaster,
    MaterialDescriptions,
    VendorMaster,
    Plant,
  } = srv.entities;



  srv.before("UPDATE", PurchasingInfoRecord, (req) => {});

  srv.before("CREATE", PurchasingInfoRecord, (req) => {})
};
