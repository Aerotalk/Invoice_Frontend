import { Invoice, Client, Vendor, Payment, Expense, Project, TimeEntry, AppNotification, AuditLog, Product, Quote, DeliveryChallan } from '../types';

export interface MockDatabase {
  invoices: Invoice[];
  clients: Client[];
  vendors: Vendor[];
  payments: Payment[];
  expenses: Expense[];
  projects: Project[];
  timeEntries: TimeEntry[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  products?: Product[];
  productUnits?: string[];
  quotes?: Quote[];
  salespersons?: string[];
  deliveryChallans?: DeliveryChallan[];
}

// Helper to generate seed dates relative to today
const daysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Initial Seed Data
const initialClients: Client[] = [
  {
    id: "c-1",
    name: "Sarah Jenkins",
    company: "Acme Corporation",
    email: "sarah@acme.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    totalBilled: 42500,
    outstandingAmount: 8500,
    status: "active",
    notes: "Prefers invoices detailed by weekly sprint. Direct bank transfer payment.",
    createdAt: daysAgo(120),
  },
  {
    id: "c-2",
    name: "Alex Rivera",
    company: "Vortex Labs",
    email: "billing@vortex.dev",
    phone: "+1 (555) 987-6543",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    totalBilled: 18200,
    outstandingAmount: 2400,
    status: "active",
    notes: "Requires net-30 terms. Net payment through credit card (Stripe).",
    createdAt: daysAgo(90),
  },
  {
    id: "c-3",
    name: "David Chen",
    company: "Starlight Digital",
    email: "david@starlight.io",
    phone: "+1 (555) 456-7890",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    totalBilled: 8900,
    outstandingAmount: 0,
    status: "active",
    notes: "Fast payer, friendly point of contact.",
    createdAt: daysAgo(60),
  },
  {
    id: "c-4",
    name: "Emma Watson",
    company: "Apex Agency",
    email: "emma@apexagency.co",
    phone: "+1 (555) 345-6789",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    totalBilled: 24000,
    outstandingAmount: 12000,
    status: "inactive",
    notes: "Temporarily on hold pending branding contract renewal.",
    createdAt: daysAgo(150),
  },
  {
    id: "c-5",
    name: "Marcus Vance",
    company: "Nova Retail",
    email: "marcus@nova.com",
    phone: "+1 (555) 765-4321",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    totalBilled: 5000,
    outstandingAmount: 5000,
    status: "active",
    notes: "New client. Setup for automatic invoicing.",
    createdAt: daysAgo(20),
  }
];

const initialVendors: Vendor[] = [
  {
    id: "v-1",
    name: "Vercel Inc.",
    company: "Vercel Inc.",
    email: "billing@vercel.com",
    phone: "+1 (800) 555-0199",
    avatar: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=150",
    totalBilled: 8500,
    outstandingAmount: 299,
    status: "active",
    notes: "Hosting and cloud deployment systems platform.",
    createdAt: daysAgo(110)
  },
  {
    id: "v-2",
    name: "Amazon Web Services",
    company: "Amazon Web Services",
    email: "billing@aws.amazon.com",
    phone: "+1 (800) 555-0245",
    avatar: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=150",
    totalBilled: 14500,
    outstandingAmount: 1200,
    status: "active",
    notes: "Cloud computing instances, database servers, and S3 file assets.",
    createdAt: daysAgo(90)
  },
  {
    id: "v-3",
    name: "Slack Technologies",
    company: "Slack Technologies",
    email: "billing@slack.com",
    phone: "+1 (800) 555-0312",
    avatar: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150",
    totalBilled: 3200,
    outstandingAmount: 0,
    status: "active",
    notes: "Team messaging and real-time collaboration operations.",
    createdAt: daysAgo(60)
  }
];

const initialProducts: Product[] = [
  {
    id: "p-1",
    name: "Enterprise Software License",
    type: "service",
    unit: "PCS - pcs",
    sellingPrice: 120000,
    description: "Annual subscription for corporate cloud platform usage.",
    imageUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=150",
    createdAt: daysAgo(30)
  },
  {
    id: "p-2",
    name: "Branding Design Package",
    type: "service",
    unit: "PCS - pcs",
    sellingPrice: 45000,
    description: "Complete visual identity design including logo, typography guidelines, and social media assets.",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=150",
    createdAt: daysAgo(20)
  },
  {
    id: "p-3",
    name: "Heavy Duty Shipping Crate",
    type: "goods",
    unit: "BOX - box",
    sellingPrice: 1250,
    description: "Industrial grade reinforced wooden shipping crate for domestic and international freight.",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150",
    createdAt: daysAgo(10)
  }
];

const initialProductUnits: string[] = [
  "BOX - box",
  "CMS - cm",
  "DOZ - dz",
  "FTS - ft",
  "GMS - g",
  "INC - in",
  "KGS - kg",
  "KME - km",
  "LBS - lb",
  "MGS - mg",
  "MLT - ml",
  "MTR - m",
  "PCS - pcs"
];

const initialSalespersons: string[] = [
  "Alex Sterling",
  "Sarah Jenkins",
  "Marcus Vance",
  "David Chen"
];

const initialQuotes: Quote[] = [
  {
    id: "q-1",
    quoteNumber: "QT-000001",
    referenceNumber: "REF-99882",
    clientId: "c-1",
    clientName: "Sarah Jenkins",
    clientCompany: "Acme Corporation",
    quoteDate: daysAgo(15),
    expiryDate: daysFromNow(15),
    salesperson: "Alex Sterling",
    projectId: "proj-1",
    projectName: "Web Portal & Branding Redesign",
    subject: "Branding materials and cloud hosting initial setup quotes.",
    items: [
      {
        id: "qi-1",
        productId: "p-2",
        name: "Branding Design Package",
        quantity: 1,
        rate: 45000,
        total: 45000
      },
      {
        id: "qi-2",
        productId: "p-3",
        name: "Heavy Duty Shipping Crate",
        quantity: 2,
        rate: 1250,
        total: 2500
      }
    ],
    subtotal: 47500,
    discountRate: 5,
    discountAmount: 2375,
    taxType: "tds",
    taxRate: 10,
    taxAmount: 4512.5,
    adjustment: -137.5,
    total: 49500,
    status: "accepted",
    customerNotes: "Looking forward for your business.",
    terms: "Payment terms standard net-30.",
    createdAt: daysAgo(15)
  },
  {
    id: "q-2",
    quoteNumber: "QT-000002",
    referenceNumber: "REF-77332",
    clientId: "c-2",
    clientName: "Alex Rivera",
    clientCompany: "Vortex Labs",
    quoteDate: daysAgo(2),
    expiryDate: daysFromNow(28),
    salesperson: "Sarah Jenkins",
    subject: "Enterprise Software License subscription offering.",
    items: [
      {
        id: "qi-3",
        productId: "p-1",
        name: "Enterprise Software License",
        quantity: 1,
        rate: 120000,
        total: 120000
      }
    ],
    subtotal: 120000,
    discountRate: 0,
    discountAmount: 0,
    taxType: "tcs",
    taxRate: 5,
    taxAmount: 6000,
    adjustment: 0,
    total: 126000,
    status: "sent",
    customerNotes: "Looking forward for your business.",
    terms: "TCS rates applicable at base level.",
    createdAt: daysAgo(2)
  }
];

const initialChallans: DeliveryChallan[] = [
  {
    id: "dc-1",
    challanNumber: "DC-00001",
    referenceNumber: "REF-CHAL-111",
    clientId: "c-1",
    clientName: "Sarah Jenkins",
    clientCompany: "Acme Corporation",
    challanDate: daysAgo(10),
    challanType: "Supply for Job Work",
    items: [
      {
        id: "dci-1",
        productId: "p-3",
        name: "Heavy Duty Shipping Crate",
        quantity: 5,
        rate: 1250,
        total: 6250
      }
    ],
    subtotal: 6250,
    discountRate: 0,
    discountAmount: 0,
    adjustment: 0,
    total: 6250,
    status: "issued",
    customerNotes: "Supply for standard job work operations. Non-taxable delivery challan.",
    terms: "Goods should be returned in original condition.",
    createdAt: daysAgo(10)
  },
  {
    id: "dc-2",
    challanNumber: "DC-00002",
    referenceNumber: "REF-CHAL-222",
    clientId: "c-2",
    clientName: "Alex Rivera",
    clientCompany: "Vortex Labs",
    challanDate: daysAgo(1),
    challanType: "Supply on Approval",
    items: [
      {
        id: "dci-2",
        productId: "p-1",
        name: "Enterprise Software License",
        quantity: 1,
        rate: 120000,
        total: 120000
      }
    ],
    subtotal: 120000,
    discountRate: 10,
    discountAmount: 12000,
    adjustment: 0,
    total: 108000,
    status: "draft",
    customerNotes: "Delivery on approval basis.",
    terms: "Approval timeframe 15 days.",
    createdAt: daysAgo(1)
  }
];

const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    invoiceNumber: "INV-2026-001",
    clientId: "c-1",
    clientName: "Sarah Jenkins",
    clientCompany: "Acme Corporation",
    clientEmail: "sarah@acme.com",
    issueDate: daysAgo(25),
    dueDate: daysAgo(5),
    items: [
      { id: "i-1", description: "UI/UX Design - Landing Page Redesign", quantity: 1, rate: 4500, total: 4500 },
      { id: "i-2", description: "Frontend Development - React Custom Modules", quantity: 40, rate: 100, total: 4000 }
    ],
    currency: "USD",
    taxRate: 10,
    taxAmount: 850,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 8500,
    total: 9350,
    amountPaid: 9350,
    amountDue: 0,
    status: "paid",
    notes: "Thank you for your business!",
    terms: "Payment due within 15 days of issue.",
    isRecurring: false,
  },
  {
    id: "INV-2026-002",
    invoiceNumber: "INV-2026-002",
    clientId: "c-2",
    clientName: "Alex Rivera",
    clientCompany: "Vortex Labs",
    clientEmail: "billing@vortex.dev",
    issueDate: daysAgo(15),
    dueDate: daysFromNow(15),
    items: [
      { id: "i-3", description: "Custom Node.js Backend API Integration", quantity: 30, rate: 120, total: 3600 },
      { id: "i-4", description: "Cloud Infrastructure Setup (AWS & Docker)", quantity: 1, rate: 1200, total: 1200 }
    ],
    currency: "USD",
    taxRate: 5,
    taxAmount: 240,
    discountRate: 5,
    discountAmount: 240,
    subtotal: 4800,
    total: 4800,
    amountPaid: 2400,
    amountDue: 2400,
    status: "partial",
    notes: "Partial payment received. Next installment due on completion.",
    terms: "Net-30 payment schedule.",
    isRecurring: false,
  },
  {
    id: "INV-2026-003",
    invoiceNumber: "INV-2026-003",
    clientId: "c-4",
    clientName: "Emma Watson",
    clientCompany: "Apex Agency",
    clientEmail: "emma@apexagency.co",
    issueDate: daysAgo(35),
    dueDate: daysAgo(5),
    items: [
      { id: "i-5", description: "Quarterly Marketing Strategy Consulting", quantity: 1, rate: 12000, total: 12000 }
    ],
    currency: "EUR",
    taxRate: 0,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 12000,
    total: 12000,
    amountPaid: 0,
    amountDue: 12000,
    status: "overdue",
    notes: "Please process ASAP.",
    terms: "Due on Receipt.",
    isRecurring: true,
    recurringInterval: "quarterly",
  },
  {
    id: "INV-2026-004",
    invoiceNumber: "INV-2026-004",
    clientId: "c-1",
    clientName: "Sarah Jenkins",
    clientCompany: "Acme Corporation",
    clientEmail: "sarah@acme.com",
    issueDate: daysAgo(5),
    dueDate: daysFromNow(25),
    items: [
      { id: "i-6", description: "Monthly Dedicated Support Retainer", quantity: 1, rate: 8500, total: 8500 }
    ],
    currency: "USD",
    taxRate: 0,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 8500,
    total: 8500,
    amountPaid: 0,
    amountDue: 8500,
    status: "sent",
    notes: "Monthly support contract invoice.",
    terms: "Net 30.",
    isRecurring: true,
    recurringInterval: "monthly",
  },
  {
    id: "INV-2026-005",
    invoiceNumber: "INV-2026-005",
    clientId: "c-5",
    clientName: "Marcus Vance",
    clientCompany: "Nova Retail",
    clientEmail: "marcus@nova.com",
    issueDate: daysAgo(1),
    dueDate: daysFromNow(14),
    items: [
      { id: "i-7", description: "Shopify Custom Application Development", quantity: 1, rate: 5000, total: 5000 }
    ],
    currency: "GBP",
    taxRate: 20,
    taxAmount: 1000,
    discountRate: 10,
    discountAmount: 500,
    subtotal: 4500,
    total: 5500,
    amountPaid: 0,
    amountDue: 5500,
    status: "viewed",
    notes: "Branding launch discount of 10% applied.",
    terms: "14 days due limit.",
    isRecurring: false,
  },
  {
    id: "INV-2026-006",
    invoiceNumber: "INV-2026-006",
    clientId: "c-3",
    clientName: "David Chen",
    clientCompany: "Starlight Digital",
    clientEmail: "david@starlight.io",
    issueDate: daysAgo(40),
    dueDate: daysAgo(10),
    items: [
      { id: "i-8", description: "Mobile App Design System", quantity: 1, rate: 8900, total: 8900 }
    ],
    currency: "USD",
    taxRate: 0,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 8900,
    total: 8900,
    amountPaid: 8900,
    amountDue: 0,
    status: "paid",
    notes: "Thanks!",
    terms: "Due on completion.",
    isRecurring: false,
  },
  {
    id: "INV-2026-007",
    invoiceNumber: "INV-2026-007",
    clientId: "c-1",
    clientName: "Sarah Jenkins",
    clientCompany: "Acme Corporation",
    clientEmail: "sarah@acme.com",
    issueDate: daysAgo(0),
    dueDate: daysFromNow(30),
    items: [
      { id: "i-9", description: "UI/UX Strategic Consultation", quantity: 1, rate: 2891, total: 2891 }
    ],
    currency: "INR",
    taxRate: 0,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 2891,
    total: 2891,
    amountPaid: 0,
    amountDue: 2891,
    status: "scheduled",
    notes: "Automated cron schedule dispatch enabled.",
    terms: "Due on delivery dispatch.",
    isRecurring: false,
    isScheduled: true,
    scheduledSendDate: daysFromNow(5)
  }
];

const initialPayments: Payment[] = [
  {
    id: "p-101",
    invoiceId: "INV-2026-001",
    invoiceNumber: "INV-2026-001",
    clientName: "Sarah Jenkins",
    clientCompany: "Acme Corporation",
    amount: 9350,
    method: "bank_transfer",
    status: "success",
    date: daysAgo(22),
    currency: "USD",
  },
  {
    id: "p-102",
    invoiceId: "INV-2026-002",
    invoiceNumber: "INV-2026-002",
    clientName: "Alex Rivera",
    clientCompany: "Vortex Labs",
    amount: 2400,
    method: "credit_card",
    status: "success",
    date: daysAgo(14),
    currency: "USD",
  },
  {
    id: "p-103",
    invoiceId: "INV-2026-006",
    invoiceNumber: "INV-2026-006",
    clientName: "David Chen",
    clientCompany: "Starlight Digital",
    amount: 8900,
    method: "stripe",
    status: "success",
    date: daysAgo(38),
    currency: "USD",
  }
];

const initialExpenses: Expense[] = [
  {
    id: "e-1",
    category: "Software",
    amount: 299,
    description: "Vercel Enterprise Team Subscription",
    date: daysAgo(10),
    receiptUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300",
    isTaxDeductible: true,
  },
  {
    id: "e-2",
    category: "Marketing",
    amount: 1500,
    description: "LinkedIn Lead Generation Ads Campaigns",
    date: daysAgo(18),
    receiptUrl: null,
    isTaxDeductible: true,
  },
  {
    id: "e-3",
    category: "Rent",
    amount: 2200,
    description: "WeWork Dedicated Studio - Monthly Billing",
    date: daysAgo(28),
    receiptUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300",
    isTaxDeductible: true,
  },
  {
    id: "e-4",
    category: "Office Supplies",
    amount: 120,
    description: "Ergonomic keyboard and desk accessory packages",
    date: daysAgo(5),
    receiptUrl: null,
    isTaxDeductible: false,
  },
  {
    id: "e-5",
    category: "Travel",
    amount: 450,
    description: "Flights to SaaS Conference in New York",
    date: daysAgo(22),
    receiptUrl: null,
    isTaxDeductible: true,
  }
];

const initialProjects: Project[] = [
  {
    id: "proj-1",
    name: "Web Portal & Branding Redesign",
    clientName: "Acme Corporation",
    clientId: "c-1",
    status: "in-progress",
    budget: 25000,
    progress: 68,
    dueDate: daysFromNow(45),
    teamMembers: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
    ],
    tasks: [
      { id: "t-1", title: "Finalize visual style guide", status: "completed", assignee: "Sarah Jenkins" },
      { id: "t-2", title: "Build responsive dashboard prototype", status: "in-progress", assignee: "Alex Rivera" },
      { id: "t-3", title: "Implement Stripe Checkout flows", status: "todo", assignee: "David Chen" },
      { id: "t-4", title: "Accessibility audit and linting fixes", status: "todo", assignee: "Alex Rivera" }
    ],
    timeLogs: [
      { id: "tl-1", taskName: "Design mockups approval", hours: 14, date: daysAgo(12), billingRate: 120 },
      { id: "tl-2", taskName: "Frontend components structure", hours: 25, date: daysAgo(8), billingRate: 100 }
    ],
  },
  {
    id: "proj-2",
    name: "Custom E-Commerce Launch",
    clientName: "Nova Retail",
    clientId: "c-5",
    status: "in-progress",
    budget: 15000,
    progress: 35,
    dueDate: daysFromNow(60),
    teamMembers: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
    ],
    tasks: [
      { id: "t-5", title: "Shopify API Setup and OAuth Hook", status: "completed", assignee: "Sarah Jenkins" },
      { id: "t-6", title: "Inventory synchronisation workers", status: "in-progress", assignee: "Marcus Vance" },
      { id: "t-7", title: "Checkout custom theme template integration", status: "todo", assignee: "Sarah Jenkins" }
    ],
    timeLogs: [
      { id: "tl-3", taskName: "Shopify Webhooks configuration", hours: 8, date: daysAgo(2), billingRate: 150 }
    ],
  },
  {
    id: "proj-3",
    name: "Mobile App Wireframing",
    clientName: "Starlight Digital",
    clientId: "c-3",
    status: "completed",
    budget: 8900,
    progress: 100,
    dueDate: daysAgo(10),
    teamMembers: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
    ],
    tasks: [
      { id: "t-8", title: "User journey flow chart diagrams", status: "completed", assignee: "David Chen" },
      { id: "t-9", title: "High-fidelity Figma wireframes", status: "completed", assignee: "David Chen" }
    ],
    timeLogs: [
      { id: "tl-4", taskName: "Figma wireframing", hours: 50, date: daysAgo(15), billingRate: 110 }
    ],
  }
];

const initialTimeEntries: TimeEntry[] = [
  {
    id: "te-1",
    projectId: "proj-1",
    projectName: "Web Portal & Branding Redesign",
    taskName: "Build responsive dashboard prototype",
    hours: 5.5,
    date: daysAgo(1),
    isBillable: true,
    billingRate: 100,
    description: "Polishing charts and adding Framer Motion layout grid animations to metric boxes."
  },
  {
    id: "te-2",
    projectId: "proj-1",
    projectName: "Web Portal & Branding Redesign",
    taskName: "Design mockups approval",
    hours: 3.2,
    date: daysAgo(3),
    isBillable: true,
    billingRate: 120,
    description: "Incorporated critical Acme team design feedback on typography sizing and color accents."
  },
  {
    id: "te-3",
    projectId: "proj-2",
    projectName: "Custom E-Commerce Launch",
    taskName: "Inventory synchronisation workers",
    hours: 6.0,
    date: daysAgo(2),
    isBillable: true,
    billingRate: 150,
    description: "Configured resilient Shopify queue workers with automated backoff retry strategy."
  },
  {
    id: "te-4",
    projectId: "proj-2",
    projectName: "Custom E-Commerce Launch",
    taskName: "Internal Sync Admin Meeting",
    hours: 1.5,
    date: daysAgo(4),
    isBillable: false,
    billingRate: 0,
    description: "Discussed database sync timings with the Nova backend engineering staff."
  }
];

const initialNotifications: AppNotification[] = [
  {
    id: "n-1",
    title: "Invoice Paid",
    description: "Sarah Jenkins (Acme Corporation) paid invoice INV-2026-001 totaling $9,350.00.",
    type: "payment",
    isRead: false,
    date: daysAgo(2) + "T10:30:00Z",
  },
  {
    id: "n-2",
    title: "Invoice Viewed",
    description: "Marcus Vance (Nova Retail) has viewed invoice INV-2026-005.",
    type: "invoice",
    isRead: false,
    date: daysAgo(1) + "T14:45:00Z",
  },
  {
    id: "n-3",
    title: "Expense Logged",
    description: "A new software license expense was created for Vercel ($299.00).",
    type: "system",
    isRead: true,
    date: daysAgo(10) + "T09:00:00Z",
  },
  {
    id: "n-4",
    title: "Timer Alert",
    description: "You logged 5.5 hours yesterday for the project Acme Web Portal redesign.",
    type: "alert",
    isRead: true,
    date: daysAgo(1) + "T18:00:00Z",
  }
];

const initialAuditLogs: AuditLog[] = [
  {
    id: "al-1",
    user: "Admin (Demo Account)",
    action: "Invoice Created",
    details: "Created draft invoice INV-2026-005 for Nova Retail.",
    timestamp: daysAgo(1) + "T12:00:00Z"
  },
  {
    id: "al-2",
    user: "Admin (Demo Account)",
    action: "Timer Logged",
    details: "Logged 5.5 billable hours on Project 'Web Portal & Branding Redesign'.",
    timestamp: daysAgo(1) + "T17:35:00Z"
  },
  {
    id: "al-3",
    user: "Admin (Demo Account)",
    action: "Status Transition",
    details: "Invoice INV-2026-002 status updated from Sent to Partial after $2,400.00 credit payment.",
    timestamp: daysAgo(14) + "T16:20:00Z"
  }
];

const LOCAL_STORAGE_KEY = "invoiceiq_db_state_v2";

export const getMockDB = (): MockDatabase => {
  if (typeof window === "undefined") {
    return {
      invoices: initialInvoices,
      clients: initialClients,
      vendors: initialVendors,
      payments: initialPayments,
      expenses: initialExpenses,
      projects: initialProjects,
      timeEntries: initialTimeEntries,
      notifications: initialNotifications,
      auditLogs: initialAuditLogs,
      products: initialProducts,
      productUnits: initialProductUnits,
      quotes: initialQuotes,
      salespersons: initialSalespersons,
      deliveryChallans: initialChallans,
    };
  }

  const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      // Auto-fill vendors if upgrading existing database state
      if (!parsed.vendors) {
        parsed.vendors = initialVendors;
      }
      if (!parsed.products) {
        parsed.products = initialProducts;
      }
      if (!parsed.productUnits) {
        parsed.productUnits = initialProductUnits;
      }
      if (!parsed.quotes) {
        parsed.quotes = initialQuotes;
      }
      if (!parsed.salespersons) {
        parsed.salespersons = initialSalespersons;
      }
      if (!parsed.deliveryChallans) {
        parsed.deliveryChallans = initialChallans;
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse mock database, resetting seeds", e);
    }
  }

  const db: MockDatabase = {
    invoices: initialInvoices,
    clients: initialClients,
    vendors: initialVendors,
    payments: initialPayments,
    expenses: initialExpenses,
    projects: initialProjects,
    timeEntries: initialTimeEntries,
    notifications: initialNotifications,
    auditLogs: initialAuditLogs,
    products: initialProducts,
    productUnits: initialProductUnits,
    quotes: initialQuotes,
    salespersons: initialSalespersons,
    deliveryChallans: initialChallans,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
  return db;
};

export const saveMockDB = (db: MockDatabase): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
  }
};
