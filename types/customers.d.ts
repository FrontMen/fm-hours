interface Customer {
  id: string;
  name: string;
  debtor?: string; // deprecated
  isBillable: boolean;
  isDefault: boolean;
  archived?: boolean;
  archivedDate?: number;
}

interface CustomersStoreState {
  customers: Customer[];
}
