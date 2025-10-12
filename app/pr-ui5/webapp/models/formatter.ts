// webapp/model/formatter.ts
import Core from "sap/ui/core/Core";

/** Vendor / supplier shape we actually use in formatters */
interface SupplierLike {
  supplier?: string;
  supplierName?: string;
  street?: string;
  city?: string;
  country?: string;
  [k: string]: unknown;
}

/** PIR row that (may) contain an expanded supplier */
interface PIRow {
  purchasingInfoRecord?: string;
  supplier?: SupplierLike | string; // may be just an ID if not expanded
  [k: string]: unknown;
}

/** Material description entity */
interface MaterialDescriptions {
  language?: string;              // e.g. "en" or "en-US"
  materialDescriptions?: string;  // the actual text
  [k: string]: unknown;
}

// --- helpers ---------------------------------------------------------------

const firstPir = (a: unknown): PIRow | null =>
  Array.isArray(a) && a.length ? (a[0] as PIRow) : null;

const uiLang = () => {
  const full = (Core.getConfiguration().getLanguage?.() ?? "en").toLowerCase();
  return { full, lang: full.split("-")[0] };
};

const fmtAddr = (s?: SupplierLike | null): string => {
  if (!s || typeof s !== "object") return "";
  return [s.street, s.city, s.country].filter(Boolean).join(", ");
};

// --- public API (used from XML) -------------------------------------------

const formatter = {
  /** First PIR → supplier id */
  pickFirstSupplierId(aPIRs: unknown): string {
    const pir = firstPir(aPIRs);
    if (!pir) return "";
    const s = pir.supplier;
    if (!s) return "";
    return typeof s === "string" ? s : (s.supplier || "");
  },

  /** First PIR → supplier name (fallback to id) */
  pickFirstSupplierName(aPIRs: unknown): string {
    const pir = firstPir(aPIRs);
    const s = pir && pir.supplier;
    if (!s) return "";
    if (typeof s === "string") return s;
    return s.supplierName || s.supplier || "";
  },

  /** First PIR → formatted supplier address */
  pickFirstSupplierAddress(aPIRs: unknown): string {
    const pir = firstPir(aPIRs);
    const s = pir && pir.supplier;
    return fmtAddr(typeof s === "object" ? (s as SupplierLike) : undefined);
  },

  /** MaterialDescriptions[] → best description for UI language */
  pickDescriptionByUILang(aDescs: unknown): string {
    const arr = Array.isArray(aDescs)
      ? (aDescs as MaterialDescriptions[])
      : [];
    if (!arr.length) return "";

    const { lang, full } = uiLang();

    // exact match (en-US)
    const byFull = arr.find(
      d => (d.language || "").toLowerCase() === full
    );
    if (byFull?.materialDescriptions) return byFull.materialDescriptions;

    // base lang match (en)
    const byLang = arr.find(
      d => (d.language || "").toLowerCase().split("-")[0] === lang
    );
    if (byLang?.materialDescriptions) return byLang.materialDescriptions;

    // first non-empty
    const firstWithText = arr.find(d => !!d.materialDescriptions);
    return firstWithText?.materialDescriptions || "";
  },

  /** Generic address formatter (street, building, city, postal, country) */
  formatAddress(
    street?: string,
    building?: string,
    city?: string,
    postalCode?: string,
    country?: string
  ): string {
    return [street, building, city, postalCode, country]
      .filter(Boolean)
      .join(", ");
  }
};

export default formatter;
