interface Customer {
  id: string;
  name: string;
  debtor: string;
  isBillable: boolean;
  isDefault: boolean;
  archived?: boolean;
  archivedDate?: number;
}

interface CustomerOption {
  text: string;
  value?: string;
  disabled?: boolean;
}

interface CustomersStoreState {
  customers: Customer[];
  selectedCustomer: Customer | null;
}
