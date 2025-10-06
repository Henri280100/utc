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
 suggestion?: {                  // OPTIONAL (enable suggestions)
    enabled?: boolean;            // default: false
    entityPath?: string;          // default: cfg.entityPath
    displayPath?: string;         // default: cfg.textPath || cfg.keyPath
    secondaryPath?: string;       // optional right-side text
    maxItems?: number;            // default: 8
  };
};
