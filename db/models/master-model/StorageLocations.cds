namespace master.table;

entity StorageLocations {
    key plant                      : String(4);
    key storageLocation            : String(4);
        storageLocationDescription : String(30);
}
