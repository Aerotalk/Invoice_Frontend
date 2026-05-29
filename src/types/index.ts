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

export type ExpenseCategory = 'Software' | 'Marketing' | 'Rent' | 'Office Supplies' | 'Travel' | 'Consulting' | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  receiptUrl: string | null;
  isTaxDeductible: boolean;
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

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientId: string;
  status: ProjectStatus;
  budget: number;
  progress: number;
  dueDate: string;
  teamMembers: string[];
  tasks: Task[];
  timeLogs: TimeLog[];
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
}
