namespace master.table;

using {Language} from '@sap/cds/common';

entity MaterialDescriptions {
    key material             : String(40);
    key language             : Language;
        materialDescriptions : String(40);
}
