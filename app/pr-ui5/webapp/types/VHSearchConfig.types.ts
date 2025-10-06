export type VHSearchConfig = {
  modelName: string;
  tableId: string;
  basicSearchPaths: string[];
  useODataSearch?: boolean;
  entityPath?: string;
  keyPath?: string;
  textPath?: string;
  select?: string[];
};
