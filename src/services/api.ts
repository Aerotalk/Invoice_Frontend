import { getMockDB, saveMockDB, MockDatabase } from '../mock/database';
import { Invoice, Client, Payment, Expense, Project, TimeEntry, AuditLog, Product, Quote, DeliveryChallan } from '../types';

// Network latency simulator
const delay = (ms: number = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to generate dates relative to today
const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const apiService = {
  // --- DASHBOARD DATA ---
  getDashboardStats: async () => {
    await delay(300);
    const db = getMockDB();
    
    const totalRevenue = db.payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);
      
    const outstandingInvoices = db.invoices
      .filter(i => i.status === 'sent' || i.status === 'viewed' || i.status === 'partial' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.amountDue, 0);

    const paidInvoicesCount = db.invoices.filter(i => i.status === 'paid').length;
    const overdueInvoicesCount = db.invoices.filter(i => i.status === 'overdue').length;

    // Monthly earnings chart generator (last 6 months)
    const monthlyEarnings = [
      { name: 'Dec', revenue: 14500, expenses: 3100 },
      { name: 'Jan', revenue: 18200, expenses: 4200 },
      { name: 'Feb', revenue: 16800, expenses: 2900 },
      { name: 'Mar', revenue: 21500, expenses: 5100 },
      { name: 'Apr', revenue: 24000, expenses: 3800 },
      { name: 'May', revenue: totalRevenue, expenses: db.expenses.reduce((sum, e) => sum + e.amount, 0) },
    ];

    // Status distribution
    const statusPieData = [
      { name: 'Paid', value: db.invoices.filter(i => i.status === 'paid').length, color: '#10b981' },
      { name: 'Pending', value: db.invoices.filter(i => i.status === 'sent' || i.status === 'viewed' || i.status === 'partial').length, color: '#f59e0b' },
      { name: 'Overdue', value: db.invoices.filter(i => i.status === 'overdue').length, color: '#ef4444' },
      { name: 'Draft', value: db.invoices.filter(i => i.status === 'draft').length, color: '#64748b' },
    ];

    return {
      stats: {
        totalRevenue,
        outstandingInvoices,
        paidInvoicesCount,
        overdueInvoicesCount
      },
      monthlyEarnings,
      statusPieData,
      recentInvoices: db.invoices.slice(0, 5),
      recentPayments: db.payments.slice(0, 5),
    };
  },

  // --- CLIENTS MODULE ---
  getClients: async () => {
    await delay(400);
    return getMockDB().clients;
  },

  getClientById: async (id: string) => {
    await delay(200);
    const db = getMockDB();
    const client = db.clients.find(c => c.id === id);
    if (!client) throw new Error("Client not found");

    const invoices = db.invoices.filter(i => i.clientId === id);
    const payments = db.payments.filter(p => db.invoices.some(i => i.id === p.invoiceId && i.clientId === id));
    const projects = db.projects.filter(p => p.clientId === id);

    return {
      client,
      invoices,
      payments,
      projects
    };
  },

  createClient: async (clientData: Omit<Client, 'id' | 'totalBilled' | 'outstandingAmount' | 'createdAt'>) => {
    await delay(500);
    const db = getMockDB();
    const newClient: Client = {
      ...clientData,
      id: `c-${Date.now()}`,
      totalBilled: 0,
      outstandingAmount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.clients = [newClient, ...db.clients];
    
    // Add audit log
    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Client Added",
      details: `Added new client ${newClient.name} (${newClient.company})`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return newClient;
  },

  updateClient: async (id: string, clientData: Partial<Client>) => {
    await delay(400);
    const db = getMockDB();
    db.clients = db.clients.map(c => 
      c.id === id ? { ...c, ...clientData } as Client : c
    );
    saveMockDB(db);
    return db.clients.find(c => c.id === id);
  },

  deleteClient: async (id: string) => {
    await delay(350);
    const db = getMockDB();
    db.clients = db.clients.filter(c => c.id !== id);
    db.invoices = db.invoices.filter(i => i.clientId !== id);
    db.projects = db.projects.filter(p => p.clientId !== id);
    
    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Client Deleted",
      details: `Deleted client and related data for ID ${id}`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return true;
  },

  // --- VENDORS MODULE ---
  getVendors: async () => {
    await delay(400);
    return getMockDB().vendors || [];
  },

  getVendorById: async (id: string) => {
    await delay(200);
    const db = getMockDB();
    const vendor = (db.vendors || []).find(v => v.id === id);
    if (!vendor) throw new Error("Vendor not found");

    const expenses = db.expenses.filter(e => 
      e.description.toLowerCase().includes(vendor.name.toLowerCase()) || 
      e.description.toLowerCase().includes(vendor.company.toLowerCase())
    );

    return {
      vendor,
      expenses
    };
  },

  createVendor: async (vendorData: any) => {
    await delay(500);
    const db = getMockDB();
    const newVendor = {
      ...vendorData,
      id: `v-${Date.now()}`,
      totalBilled: vendorData.totalBilled || 0,
      outstandingAmount: vendorData.outstandingAmount || 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.vendors = [newVendor, ...(db.vendors || [])];

    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Vendor Added",
      details: `Added new vendor ${newVendor.name} (${newVendor.company})`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return newVendor;
  },

  updateVendor: async (id: string, vendorData: any) => {
    await delay(400);
    const db = getMockDB();
    db.vendors = (db.vendors || []).map(v => 
      v.id === id ? { ...v, ...vendorData } : v
    );
    saveMockDB(db);
    return (db.vendors || []).find(v => v.id === id);
  },

  deleteVendor: async (id: string) => {
    await delay(350);
    const db = getMockDB();
    db.vendors = (db.vendors || []).filter(v => v.id !== id);

    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Vendor Deleted",
      details: `Deleted vendor ID ${id}`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return true;
  },

  // --- PRODUCTS MODULE ---
  getProducts: async () => {
    await delay(300);
    return getMockDB().products || [];
  },

  createProduct: async (productData: any) => {
    await delay(400);
    const db = getMockDB();
    const newProduct = {
      ...productData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.products = [newProduct, ...(db.products || [])];

    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Product Added",
      details: `Added new item: ${newProduct.name} (${newProduct.type})`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return newProduct;
  },

  updateProduct: async (id: string, productData: any) => {
    await delay(300);
    const db = getMockDB();
    db.products = (db.products || []).map(p => 
      p.id === id ? { ...p, ...productData } : p
    );
    saveMockDB(db);
    return (db.products || []).find(p => p.id === id);
  },

  deleteProduct: async (id: string) => {
    await delay(300);
    const db = getMockDB();
    db.products = (db.products || []).filter(p => p.id !== id);

    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Product Deleted",
      details: `Deleted product ID ${id}`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return true;
  },

  getProductUnits: async () => {
    await delay(100);
    return getMockDB().productUnits || [];
  },

  saveProductUnits: async (units: string[]) => {
    await delay(200);
    const db = getMockDB();
    db.productUnits = units;
    saveMockDB(db);
    return units;
  },

  // --- QUOTATIONS MODULE ---
  getQuotes: async () => {
    await delay(300);
    return getMockDB().quotes || [];
  },

  createQuote: async (quoteData: any) => {
    await delay(500);
    const db = getMockDB();
    const newQuote: Quote = {
      ...quoteData,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.quotes = [newQuote, ...(db.quotes || [])];

    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Quote Created",
      details: `Created quotation ${newQuote.quoteNumber} for client ${newQuote.clientName} (Total: ${newQuote.total})`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return newQuote;
  },

  updateQuote: async (id: string, quoteData: any) => {
    await delay(400);
    const db = getMockDB();
    db.quotes = (db.quotes || []).map(q => 
      q.id === id ? { ...q, ...quoteData } as Quote : q
    );
    saveMockDB(db);
    return (db.quotes || []).find(q => q.id === id);
  },

  deleteQuote: async (id: string) => {
    await delay(350);
    const db = getMockDB();
    db.quotes = (db.quotes || []).filter(q => q.id !== id);

    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Quote Deleted",
      details: `Deleted quotation ID ${id}`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return true;
  },

  getSalespersons: async () => {
    await delay(100);
    return getMockDB().salespersons || [];
  },

  createSalesperson: async (name: string) => {
    await delay(200);
    const db = getMockDB();
    if (!db.salespersons) db.salespersons = [];
    if (!db.salespersons.includes(name)) {
      db.salespersons = [...db.salespersons, name];
    }
    saveMockDB(db);
    return db.salespersons;
  },

  // --- DELIVERY CHALLANS MODULE ---
  getChallans: async () => {
    await delay(300);
    return getMockDB().deliveryChallans || [];
  },

  createChallan: async (challanData: any) => {
    await delay(500);
    const db = getMockDB();
    const newChallan: DeliveryChallan = {
      ...challanData,
      id: `dc-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.deliveryChallans = [newChallan, ...(db.deliveryChallans || [])];

    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Challan Created",
      details: `Created delivery challan ${newChallan.challanNumber} for client ${newChallan.clientName} (Reason: ${newChallan.challanType})`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return newChallan;
  },

  updateChallan: async (id: string, challanData: any) => {
    await delay(400);
    const db = getMockDB();
    db.deliveryChallans = (db.deliveryChallans || []).map(dc => 
      dc.id === id ? { ...dc, ...challanData } as DeliveryChallan : dc
    );
    saveMockDB(db);
    return (db.deliveryChallans || []).find(dc => dc.id === id);
  },

  deleteChallan: async (id: string) => {
    await delay(350);
    const db = getMockDB();
    db.deliveryChallans = (db.deliveryChallans || []).filter(dc => dc.id !== id);

    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Challan Deleted",
      details: `Deleted delivery challan ID ${id}`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return true;
  },

  // --- INVOICES MODULE ---
  getInvoices: async () => {
    await delay(500);
    return getMockDB().invoices;
  },

  getInvoiceById: async (id: string) => {
    await delay(300);
    const db = getMockDB();
    const invoice = db.invoices.find(i => i.id === id);
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  },

  createInvoice: async (invoiceData: Omit<Invoice, 'id' | 'subtotal' | 'taxAmount' | 'discountAmount' | 'total' | 'amountPaid' | 'amountDue' | 'items'> & { items: Omit<Invoice['items'][0], 'id'>[] }) => {
    await delay(600);
    const db = getMockDB();
    
    // Calculations
    const itemsWithIds = invoiceData.items.map((item, index) => ({
      ...item,
      id: `i-${Date.now()}-${index}`,
      total: item.quantity * item.rate
    }));

    const subtotal = itemsWithIds.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = subtotal * (invoiceData.discountRate / 100);
    const taxableSubtotal = subtotal - discountAmount;
    const taxAmount = taxableSubtotal * (invoiceData.taxRate / 100);
    const total = taxableSubtotal + taxAmount;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: invoiceData.invoiceNumber || `INV-${Date.now()}`,
      items: itemsWithIds,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      amountPaid: invoiceData.status === 'paid' ? total : 0,
      amountDue: invoiceData.status === 'paid' ? 0 : total,
    } as Invoice;

    db.invoices = [newInvoice, ...db.invoices];

    // Update client summaries
    db.clients = db.clients.map(c => {
      if (c.id === newInvoice.clientId) {
        return {
          ...c,
          totalBilled: c.totalBilled + total,
          outstandingAmount: c.outstandingAmount + (newInvoice.status === 'paid' ? 0 : total)
        };
      }
      return c;
    });

    // If paid, create payment record
    if (newInvoice.status === 'paid') {
      const newPayment: Payment = {
        id: `p-${Date.now()}`,
        invoiceId: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        clientName: newInvoice.clientName,
        clientCompany: newInvoice.clientCompany,
        amount: total,
        method: "stripe",
        status: "success",
        date: newInvoice.issueDate,
        currency: newInvoice.currency
      };
      db.payments = [newPayment, ...db.payments];
    }

    // Add Audit log
    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Invoice Created",
      details: `Created invoice ${newInvoice.invoiceNumber} for ${newInvoice.clientName} (Total: ${newInvoice.total})`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return newInvoice;
  },

  updateInvoice: async (id: string, updates: Partial<Invoice>) => {
    await delay(400);
    const db = getMockDB();
    db.invoices = db.invoices.map(inv => {
      if (inv.id === id) {
        const merged = { ...inv, ...updates } as Invoice;
        // Recalculate amountDue if status is changed to paid
        if (updates.status === 'paid') {
          merged.amountPaid = merged.total;
          merged.amountDue = 0;
        }
        return merged;
      }
      return inv;
    });
    saveMockDB(db);
    return db.invoices.find(i => i.id === id);
  },

  duplicateInvoice: async (id: string) => {
    await delay(400);
    const db = getMockDB();
    const original = db.invoices.find(i => i.id === id);
    if (!original) throw new Error("Original invoice not found");

    const stamp = Date.now().toString().slice(-4);
    const newInvoice: Invoice = {
      ...original,
      id: `INV-DUP-${stamp}`,
      invoiceNumber: `INV-2026-DUP${stamp}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: daysFromNow(15),
      status: 'draft',
      amountPaid: 0,
      amountDue: original.total,
    };

    db.invoices = [newInvoice, ...db.invoices];
    saveMockDB(db);
    return newInvoice;
  },

  // --- PAYMENTS MODULE ---
  getPayments: async () => {
    await delay(400);
    return getMockDB().payments;
  },

  recordPayment: async (paymentData: Omit<Payment, 'id' | 'date' | 'status'>) => {
    await delay(500);
    const db = getMockDB();
    const newPayment: Payment = {
      ...paymentData,
      id: `p-${Date.now()}`,
      status: "success",
      date: new Date().toISOString().split('T')[0]
    };
    db.payments = [newPayment, ...db.payments];

    // Update invoice status
    db.invoices = db.invoices.map(inv => {
      if (inv.id === paymentData.invoiceId) {
        const nextPaid = inv.amountPaid + paymentData.amount;
        const nextDue = Math.max(0, inv.total - nextPaid);
        const nextStatus = nextDue === 0 ? 'paid' : 'partial';
        return {
          ...inv,
          amountPaid: nextPaid,
          amountDue: nextDue,
          status: nextStatus as any
        };
      }
      return inv;
    });

    // Update client balance
    const targetInvoice = db.invoices.find(i => i.id === paymentData.invoiceId);
    if (targetInvoice) {
      db.clients = db.clients.map(c => {
        if (c.id === targetInvoice.clientId) {
          return {
            ...c,
            outstandingAmount: Math.max(0, c.outstandingAmount - paymentData.amount)
          };
        }
        return c;
      });
    }

    // Add Audit log
    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Payment Recorded",
      details: `Received payment of ${newPayment.amount} for invoice ${newPayment.invoiceNumber}`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return newPayment;
  },

  refundPayment: async (id: string) => {
    await delay(500);
    const db = getMockDB();
    db.payments = db.payments.map(p => 
      p.id === id ? { ...p, status: 'refunded' as any } : p
    );
    
    // Add Audit log
    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Refund Processed",
      details: `Processed refund for payment record ID ${id}`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return db.payments.find(p => p.id === id);
  },

  // --- EXPENSES MODULE ---
  getExpenses: async () => {
    await delay(400);
    return getMockDB().expenses;
  },

  createExpense: async (expenseData: Omit<Expense, 'id'>) => {
    await delay(500);
    const db = getMockDB();
    const newExpense: Expense = {
      ...expenseData,
      id: `e-${Date.now()}`
    };
    db.expenses = [newExpense, ...db.expenses];
    saveMockDB(db);
    return newExpense;
  },

  createExpensesBulk: async (expensesList: any[]) => {
    await delay(600);
    const db = getMockDB();
    const newExpenses: Expense[] = expensesList.map((e, idx) => ({
      ...e,
      id: `e-${Date.now()}-${idx}`
    }));
    db.expenses = [...newExpenses, ...db.expenses];

    const log: AuditLog = {
      id: `al-${Date.now()}`,
      user: "Admin",
      action: "Bulk Expenses Added",
      details: `Added ${newExpenses.length} expenses in a bulk transaction`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs = [log, ...db.auditLogs];

    saveMockDB(db);
    return newExpenses;
  },

  deleteExpense: async (id: string) => {
    await delay(300);
    const db = getMockDB();
    db.expenses = db.expenses.filter(e => e.id !== id);
    saveMockDB(db);
    return true;
  },

  // --- PROJECTS MODULE ---
  getProjects: async () => {
    await delay(400);
    return getMockDB().projects;
  },

  getProjectById: async (id: string) => {
    await delay(200);
    const db = getMockDB();
    const project = db.projects.find(p => p.id === id);
    if (!project) throw new Error("Project not found");
    return project;
  },

  createProject: async (projectData: Omit<Project, 'id' | 'progress' | 'tasks' | 'timeLogs'>) => {
    await delay(400);
    const db = getMockDB();
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      progress: 0,
      tasks: [],
      timeLogs: []
    };
    db.projects = [newProj, ...db.projects];
    saveMockDB(db);
    return newProj;
  },

  updateProjectTasks: async (id: string, tasks: Project['tasks']) => {
    await delay(300);
    const db = getMockDB();
    
    // Calculate new progress based on completed tasks
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    db.projects = db.projects.map(p => 
      p.id === id ? { ...p, tasks, progress } : p
    );
    saveMockDB(db);
    return db.projects.find(p => p.id === id);
  },

  // --- TIME TRACKING ---
  getTimeEntries: async () => {
    await delay(300);
    return getMockDB().timeEntries;
  },

  createTimeEntry: async (entryData: Omit<TimeEntry, 'id'>) => {
    await delay(400);
    const db = getMockDB();
    const newEntry: TimeEntry = {
      ...entryData,
      id: `te-${Date.now()}`
    };
    db.timeEntries = [newEntry, ...db.timeEntries];
    
    // Also append to project's internal logs if project matches
    db.projects = db.projects.map(p => {
      if (p.id === entryData.projectId) {
        return {
          ...p,
          timeLogs: [
            ...p.timeLogs,
            {
              id: `tl-${Date.now()}`,
              taskName: entryData.taskName,
              hours: entryData.hours,
              date: entryData.date,
              billingRate: entryData.billingRate
            }
          ]
        };
      }
      return p;
    });

    saveMockDB(db);
    return newEntry;
  },

  // --- AUDIT LOGS ---
  getAuditLogs: async () => {
    await delay(200);
    return getMockDB().auditLogs;
  }
};
