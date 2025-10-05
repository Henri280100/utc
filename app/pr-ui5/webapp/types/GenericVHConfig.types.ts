export type VHColumn = { label: string; path: string };
export type VHField = { label: string; path: string };

export type GenericVHConfig = {
  modelName: string;
  entityPath: string;
  keyPath: string;
  textPath?: string;
  /** Visible columns in the result table */
  columns: VHColumn[];

  /** FilterBar fields (enables Show/Hide/Clear) */
  filterFields?: VHField[];

  /** Properties used for OR basic search */
  basicSearchPaths: string[];

  /** $select optimization */
  select?: string[];

  /** Multi-select tokens? */
  multi?: boolean;

  /** If backend supports $search, set true to prefer it */
  useODataSearch?: boolean;

  /** Suggestions config (optional) */
  suggestion?: {
    /** Path to read suggestions from (usually same as entityPath) */
    entityPath?: string; // default: entityPath
    /** Which property to show as suggestion text (fallbacks to keyPath) */
    displayPath?: string; // default: textPath || keyPath
    /** Optional additional text (small) e.g. description under code */
    secondaryPath?: string; // default: undefined
    /** Max suggestions to fetch */
    maxItems?: number; // default: 8
  };
};
