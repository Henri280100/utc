sap.ui.define(["sap/ui/core/Core"], function (Core) {
  "use strict";

  /** Vendor / supplier shape we actually use in formatters */

  /** PIR row that (may) contain an expanded supplier */

  /** Material description entity */

  // --- helpers ---------------------------------------------------------------

  const firstPir = a => Array.isArray(a) && a.length ? a[0] : null;
  const uiLang = () => {
    const full = (Core.getConfiguration().getLanguage?.() ?? "en").toLowerCase();
    return {
      full,
      lang: full.split("-")[0]
    };
  };
  const fmtAddr = s => {
    if (!s || typeof s !== "object") return "";
    return [s.street, s.city, s.country].filter(Boolean).join(", ");
  };

  // --- public API (used from XML) -------------------------------------------

  const formatter = {
    /** First PIR → supplier id */
    pickFirstSupplierId(aPIRs) {
      const pir = firstPir(aPIRs);
      if (!pir) return "";
      const s = pir.supplier;
      if (!s) return "";
      return typeof s === "string" ? s : s.supplier || "";
    },
    /** First PIR → supplier name (fallback to id) */
    pickFirstSupplierName(aPIRs) {
      const pir = firstPir(aPIRs);
      const s = pir && pir.supplier;
      if (!s) return "";
      if (typeof s === "string") return s;
      return s.supplierName || s.supplier || "";
    },
    /** First PIR → formatted supplier address */
    pickFirstSupplierAddress(aPIRs) {
      const pir = firstPir(aPIRs);
      const s = pir && pir.supplier;
      return fmtAddr(typeof s === "object" ? s : undefined);
    },
    /** MaterialDescriptions[] → best description for UI language */
    pickDescriptionByUILang(aDescs) {
      const arr = Array.isArray(aDescs) ? aDescs : [];
      if (!arr.length) return "";
      const {
        lang,
        full
      } = uiLang();

      // exact match (en-US)
      const byFull = arr.find(d => (d.language || "").toLowerCase() === full);
      if (byFull?.materialDescriptions) return byFull.materialDescriptions;

      // base lang match (en)
      const byLang = arr.find(d => (d.language || "").toLowerCase().split("-")[0] === lang);
      if (byLang?.materialDescriptions) return byLang.materialDescriptions;

      // first non-empty
      const firstWithText = arr.find(d => !!d.materialDescriptions);
      return firstWithText?.materialDescriptions || "";
    },
    /** Generic address formatter (street, building, city, postal, country) */
    formatAddress(street, building, city, postalCode, country) {
      return [street, building, city, postalCode, country].filter(Boolean).join(", ");
    }
  };
  return formatter;
});
//# sourceMappingURL=formatter-dbg.js.map
