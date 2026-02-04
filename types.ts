
export enum AppTab {
  DASHBOARD = 'dashboard',
  CRM = 'crm',
  FINANCE = 'finance',
  TRANSLATOR = 'translator',
  ADVISOR = 'advisor',
  PLANNER = 'planner'
}

export type FinancialModality = 'Personal' | 'Business' | 'Enterprise';

export interface Company {
  id: string;
  name: string;
  industry: string;
  currency: string;
  role: 'Owner' | 'Admin' | 'Accountant';
}

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  lastInteraction: string;
  value: number;
  status: 'Lead' | 'Customer' | 'VIP';
  type: 'Customer' | 'Vendor' | 'Partner';
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'Pending' | 'Cleared' | 'Reconciled';
  source: 'manual' | 'scanned' | 'bank';
  accountId: string; // Linked to ChartOfAccount
  attachmentUrl?: string;
  type: 'Debit' | 'Credit';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Draft';
  items: { description: string; quantity: number; price: number }[];
  type: 'Sales' | 'Purchase';
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  type: 'Checking' | 'Savings' | 'Mobile Money';
  bankName: string;
}

export interface Language {
  code: string;
  name: string;
  isAfrican: boolean;
}

export interface DailyObjective {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  deadline: string;
}
