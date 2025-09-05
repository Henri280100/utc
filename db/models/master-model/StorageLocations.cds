namespace master.table;

entity StorageLocations {
    key storageLocation            : String(4);
    key plant                      : String(4);
        storageLocationDescription : String(30);
}
