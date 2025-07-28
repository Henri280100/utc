namespace transaction.table;


entity PurchaseRequisitionAccountAssignment {
  key purchaseRequisition    : String(10);
  key purchaseReqnItem       : String(5);
  key acctAssignment         : String(2);
      acctAssignmentCategory : String(1);
      glAccount              : String(10);
      costCenter             : String(10);
      order                  : String(12);
}
