export type InvoiceStatus = 'draft' | 'sent' | 'viewd' | 'paid' | 'partial' | 'overdue' | 'viewed' | 'scheduled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  currency: string;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  notes: string;
  terms: string;
  isRecurring: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  logo?: string;
  isScheduled?: boolean;
  scheduledSendDate?: string;
  senderAddress?: string;
}

export type ClientStatus = 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
  totalBilled: number;
  outstandingAmount: number;
  status: ClientStatus;
  notes: string;
  createdAt: string;
  clientType?: 'individual' | 'business';
  country?: string;
  state?: string;
  city?: string;
  gstTreatment?: string;
  placeOfSupply?: string;
  taxPreference?: 'Taxable' | 'Tax Exempt';
}

export interface Vendor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
  totalBilled: number;
  outstandingAmount: number;
  status: 'active' | 'inactive';
  notes: string;
  createdAt: string;
  vendorType?: 'individual' | 'business';
  country?: string;
  state?: string;
  city?: string;
  displayName?: string;
  currency?: string;
  language?: string;
  pan?: string;
  paymentTerms?: string;
  enablePortal?: boolean;
  website?: string;
  department?: string;
  designation?: string;
  socialX?: string;
  skype?: string;
  socialFacebook?: string;
  billingAddress?: {
    attention?: string;
    street1?: string;
    street2?: string;
    country?: string;
    state?: string;
    city?: string;
    zip?: string;
    phone?: string;
    fax?: string;
  };
  shippingAddress?: {
    attention?: string;
    street1?: string;
    street2?: string;
    country?: string;
    state?: string;
    city?: string;
    zip?: string;
    phone?: string;
    fax?: string;
  };
  contactPersons?: Array<{
    id: string;
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>;
  customFields?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  documentsCount?: number;
}

export interface Product {
  id: string;
  name: string;
  type: 'goods' | 'service';
  unit: string;
  imageUrl?: string;
  sellingPrice: number;
  description: string;
  createdAt: string;
  hsnCode?: string;
  taxPreference?: string;
  intraStateTaxRate?: string;
  interStateTaxRate?: string;
}

export interface QuoteItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  rate: number;
  total: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired';

export interface Quote {
  id: string;
  quoteNumber: string;
  referenceNumber?: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  quoteDate: string;
  expiryDate?: string;
  salesperson?: string;
  projectId?: string;
  projectName?: string;
  subject?: string;
  items: QuoteItem[];
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  taxType: 'tds' | 'tcs';
  taxRate: number;
  taxAmount: number;
  adjustment: number;
  total: number;
  status: QuoteStatus;
  customerNotes: string;
  terms: string;
  createdAt: string;
}

export interface ChallanItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  rate: number;
  total: number;
}

export type ChallanStatus = 'draft' | 'issued' | 'returned' | 'cancelled';

export interface DeliveryChallan {
  id: string;
  challanNumber: string;
  referenceNumber?: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  challanDate: string;
  challanType: string;
  items: ChallanItem[];
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  adjustment: number;
  total: number;
  status: ChallanStatus;
  customerNotes: string;
  terms: string;
  createdAt: string;
}

export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'stripe' | 'paypal';
export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  clientCompany: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  currency: string;
}

export type ExpenseCategory = 'Software' | 'Marketing' | 'Rent' | 'Office Supplies' | 'Travel' | 'Consulting' | 'Purchase Order' | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  receiptUrl: string | null;
  isTaxDeductible: boolean;
  invoiceNumber?: string;
  notes?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  isBillable?: boolean;
  currency?: string;
  vendorId?: string;
  vendorName?: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
}

export interface TimeLog {
  id: string;
  taskName: string;
  hours: number;
  date: string;
  billingRate: number;
}

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';

export interface ProjectInvoice {
  id: string;
  invoiceId: string;
  description: string;
  date: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientId: string;
  vendors?: { id: string; name: string }[];
  status: ProjectStatus;
  budget: number;
  progress: number;
  dueDate: string;
  teamMembers: string[];
  tasks: Task[];
  timeLogs: TimeLog[];
  invoices?: ProjectInvoice[];
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  taskName: string;
  hours: number;
  date: string;
  isBillable: boolean;
  billingRate: number;
  description: string;
}

export type NotificationType = 'invoice' | 'payment' | 'system' | 'alert';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  isRead: boolean;
  date: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'accountant' | 'viewer';
  avatar: string;
  companyName: string;
  currency: string;
  logos?: string[];
  addresses?: string[];
}

