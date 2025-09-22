// webapp/model/formatter.js
sap.ui.define([], function () {
  "use strict";

  // --- small helpers ---
  function _firstPir(aPIRs) {
    return Array.isArray(aPIRs) && aPIRs.length ? aPIRs[0] : null;
  }
  function _uiLang() {
    // e.g. "en-US" -> { lang:"en", full:"en-US" }
    const full = sap.ui.getCore().getConfiguration().getLanguage() || "en";
    const lang = full.toLowerCase().split("-")[0];
    return { lang, full: full.toLowerCase() };
  }
  function _fmtAddr(supplier) {
    if (!supplier) return "";
    return [supplier.street, supplier.city, supplier.country]
      .filter(Boolean)
      .join(", ");
  }

  return {
    // -------- PurchasingInfoRecord → Supplier pickers --------
    pickFirstSupplierId: function (aPIRs) {
      const pir = _firstPir(aPIRs);
      return (
        (pir && pir.supplier && (pir.supplier.supplier || pir.supplier)) || ""
      );
    },

    pickFirstSupplierName: function (aPIRs) {
      const pir = _firstPir(aPIRs);
      const s = pir && pir.supplier;
      return (s && (s.supplierName || s.supplier)) || "";
    },

    pickFirstSupplierAddress: function (aPIRs) {
      const pir = _firstPir(aPIRs);
      return _fmtAddr(pir && pir.supplier);
    },

    // -------- MaterialDescriptions[] → description in UI language --------
    pickDescriptionByUILang: function (aDescs) {
      if (!Array.isArray(aDescs) || !aDescs.length) return "";
      const { lang, full } = _uiLang();

      // language property could be like "en" or "en-US" (case-insensitive)
      const byFull = aDescs.find(
        (d) => (d.language || "").toLowerCase() === full
      );
      if (byFull && byFull.materialDescriptions)
        return byFull.materialDescriptions;

      const byLang = aDescs.find(
        (d) => (d.language || "").toLowerCase().split("-")[0] === lang
      );
      if (byLang && byLang.materialDescriptions)
        return byLang.materialDescriptions;

      // fallback to the first non-empty description
      const firstWithText = aDescs.find((d) => d.materialDescriptions);
      return (firstWithText && firstWithText.materialDescriptions) || "";
    },

    // -------- generic address formatter (if you need it elsewhere) --------
    formatAddress: function (street, building, city, postalCode, country) {
      return [street, building, city, postalCode, country]
        .filter(Boolean)
        .join(", ");
    },
  };
});
