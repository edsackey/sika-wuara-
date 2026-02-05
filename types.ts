export enum AppTab {
  DASHBOARD = 'dashboard',
  CRM = 'crm',
  FINANCE = 'finance',
  ECOMMERCE = 'ecommerce',
  TRANSLATOR = 'translator',
  PLANNER = 'planner',
  ADVISOR = 'advisor',
  ROSCA = 'rosca',
  SIKAPAY = 'sikapay'
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
  parentId?: string;
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

export interface RoscaGroup {
  id: string;
  name: string;
  contributionAmount: number;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  members: string[];
  maxMembers: number;
  currentCycle: number;
  totalPooled: number;
  status: 'Open' | 'Active' | 'Completed';
  nextPayoutMember?: string;
  description?: string;
  penalties: PenaltyRecord[];
}

export interface PenaltyRecord {
  member: string;
  amount: number;
  reason: string;
  status: 'Unpaid' | 'Paid';
  dueDate: string;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  status: 'draft' | 'published' | 'proposed';
  variants: ProductVariant[];
  collectionId?: string;
  inventoryQuantity: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  inventory_quantity: number;
}

export interface Order {
  id: string;
  displayId: string;
  status: 'pending' | 'completed' | 'archived' | 'canceled' | 'requires_action';
  fulfillmentStatus: 'not_fulfilled' | 'partially_fulfilled' | 'fulfilled' | 'shipped' | 'partially_shipped' | 'returned' | 'canceled';
  paymentStatus: 'not_paid' | 'awaiting' | 'captured' | 'partially_refunded' | 'refunded' | 'canceled' | 'requires_action';
  total: number;
  currencyCode: string;
  createdAt: string;
  customer: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  items: {
    title: string;
    quantity: number;
    unitPrice: number;
    thumbnail?: string;
  }[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'Pending' | 'Cleared' | 'Reconciled' | 'Success' | 'Settled';
  source: 'manual' | 'scanned' | 'bank' | 'ecommerce' | 'switch';
  accountId: string;
  attachmentUrl?: string;
  type: 'Debit' | 'Credit';
  ref?: string;
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

export interface InventoryItem {
  id: string;
  sku: string;
  title: string;
  quantity: number;
  price?: number;
}

export interface BankStatementEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference: string;
  reconciled: boolean;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
}