interface Customer {
  id: string;
  name: string;
  debtor?: string; // deprecated
  isBillable: boolean;
  isDefault: boolean;
  archived?: boolean;
  archivedDate?: number;
  contract?: Contract;
}

interface CustomersStoreState {
  customers: Customer[];
}
