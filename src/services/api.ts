import api from '../lib/axios';

export const apiService = {
  // --- DASHBOARD DATA ---
  getDashboardStats: async () => {
    // For now, we return empty stats or we can build a dashboard endpoint on the backend.
    // The user requested: "all the endpoints which have dropdowns to select client vendor or project all this should be properly integrated". 
    // We will hook up the core models first.
    return {
      stats: { totalRevenue: 0, outstandingInvoices: 0, paidInvoicesCount: 0, overdueInvoicesCount: 0 },
      monthlyEarnings: [],
      statusPieData: [],
      recentInvoices: [],
      recentPayments: [],
    };
  },

  // --- CLIENTS MODULE ---
  getClients: async () => {
    const res = await api.get('/clients');
    return res.data.data.map((c: any) => ({
      ...c,
      name: c.displayName,
      clientType: c.customerType?.toLowerCase() || 'business',
      company: c.companyName,
      avatar: c.documentsAttachment,
      phone: (c.workPhone || c.mobilePhone) ? `${c.workPhoneCode || ''} ${c.workPhone || c.mobilePhone}`.trim() : 'N/A',
      status: 'active',
      totalBilled: c.totalBilled || 0,
      outstandingAmount: c.outstandingAmount || 0,
    }));
  },

  getClientById: async (id: string) => {
    const res = await api.get(`/clients/${id}`);
    const client = res.data.data;
    // Adapt the nested relation format from Prisma
    return {
      client: {
        ...client,
        name: client.displayName || client.companyName || 'Unknown Client',
        clientType: client.customerType?.toLowerCase() || 'business',
        company: client.companyName || '',
        avatar: client.documentsAttachment || '',
        phone: (client.workPhone || client.mobilePhone) ? `${client.workPhoneCode || ''} ${client.workPhone || client.mobilePhone}`.trim() : 'N/A',
        status: 'active',
        totalBilled: client.totalBilled || 0,
        outstandingAmount: client.outstandingAmount || 0,
      },
      invoices: client.quotations || [], // TBD: If quotes/invoices overlap
      payments: [],
      projects: client.projects || []
    };
  },

  createClient: async (clientData: unknown) => {
    const res = await api.post('/clients', clientData);
    return res.data.data;
  },

  updateClient: async (id: string, clientData: unknown) => {
    const res = await api.put(`/clients/${id}`, clientData);
    return res.data.data;
  },

  deleteClient: async (id: string) => {
    await api.delete(`/clients/${id}`);
    return true;
  },

  // --- VENDORS MODULE ---
  getVendors: async () => {
    const res = await api.get('/vendors');
    return res.data.data.map((v: any) => ({
      ...v,
      name: v.displayName,
      vendorType: v.vendorType?.toLowerCase() || 'business',
      company: v.companyName,
      avatar: v.documentsAttachment,
      phone: (v.workPhone || v.mobilePhone) ? `${v.workPhoneCode || ''} ${v.workPhone || v.mobilePhone}`.trim() : 'N/A',
      status: 'active',
      totalBilled: v.totalBilled || 0,
      outstandingAmount: v.outstandingAmount || 0,
    }));
  },

  getVendorById: async (id: string) => {
    const res = await api.get(`/vendors/${id}`);
    const v = res.data.data;
    return { 
      vendor: {
        ...v,
        name: v.displayName || v.companyName || 'Unknown Vendor',
        vendorType: v.vendorType?.toLowerCase() || 'business',
        company: v.companyName || '',
        avatar: v.documentsAttachment || "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=150",
        phone: (v.workPhone || v.mobilePhone) ? `${v.workPhoneCode || ''} ${v.workPhone || v.mobilePhone}`.trim() : 'N/A',
        website: v.websiteUrl || '',
        notes: v.internalRemarks || '',
        billingAddress: {
          attention: v.billingAttention || '',
          street1: v.billingStreet1 || '',
          street2: v.billingStreet2 || '',
          city: v.billingCity || '',
          state: v.billingState || '',
          country: v.billingCountry || '',
          zip: v.billingZipCode || '',
          phone: v.billingPhone || ''
        },
        shippingAddress: {
          attention: v.shippingAttention || '',
          street1: v.shippingStreet1 || '',
          street2: v.shippingStreet2 || '',
          city: v.shippingCity || '',
          state: v.shippingState || '',
          country: v.shippingCountry || '',
          zip: v.shippingZipCode || '',
          phone: v.shippingPhone || ''
        }
      }, 
      expenses: [] 
    };
  },

  createVendor: async (vendorData: unknown) => {
    const res = await api.post('/vendors', vendorData);
    return res.data.data;
  },

  updateVendor: async (id: string, vendorData: unknown) => {
    const res = await api.put(`/vendors/${id}`, vendorData);
    return res.data.data;
  },

  deleteVendor: async (id: string) => {
    await api.delete(`/vendors/${id}`);
    return true;
  },

  // --- PRODUCTS MODULE ---
  getProducts: async () => {
    const res = await api.get('/products');
    return res.data.data.map((p: any) => ({
      ...p,
      type: p.type?.toLowerCase() || 'goods',
      imageUrl: p.itemImage,
      status: 'active'
    }));
  },

  createProduct: async (productData: unknown) => {
    const res = await api.post('/products', productData);
    return res.data.data;
  },

  updateProduct: async (id: string, productData: unknown) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data.data;
  },

  deleteProduct: async (id: string) => {
    await api.delete(`/products/${id}`);
    return true;
  },

  getProductUnits: async () => {
    return ["Nos", "Kg", "Ltr", "Mtr", "Hrs"];
  },

  saveProductUnits: async (units: string[]) => {
    return units;
  },

  // --- PROJECTS MODULE ---
  getProjects: async () => {
    const res = await api.get('/projects');
    return res.data.data.map((p: any) => ({
      ...p,
      name: p.projectName,
      clientId: p.customerId,
      clientName: p.customer?.displayName || 'Unknown Client',
      vendors: p.vendors?.map((v: any) => v.vendor) || [],
      status: 'planning',
      teamMembers: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
      ]
    }));
  },

  getProjectById: async (id: string) => {
    const res = await api.get(`/projects/${id}`);
    return res.data.data;
  },

  createProject: async (projectData: unknown) => {
    const res = await api.post('/projects', projectData);
    return res.data.data;
  },

  // --- QUOTATIONS MODULE ---
  getQuotes: async () => {
    const res = await api.get('/quotations');
    return res.data.data;
  },

  createQuote: async (quoteData: Record<string, unknown>) => {
    // Adapter to transform frontend shape to backend schema shape
    const formattedData = {
      quoteNumber: quoteData.quoteNumber,
      referenceNumber: quoteData.referenceNumber,
      customerId: quoteData.clientId, // The backend uses customerId
      projectId: quoteData.projectId,
      quoteDate: quoteData.issueDate || quoteData.quoteDate,
      expiryDate: quoteData.expiryDate,
      subTotal: quoteData.subtotal,
      discountRate: quoteData.discountRate,
      discountAmount: quoteData.discountAmount,
      taxRate: quoteData.taxRate,
      totalTax: quoteData.taxAmount,
      adjustment: quoteData.adjustment,
      totalAmount: quoteData.total,
      termsConditions: quoteData.terms,
      customerNotes: quoteData.notes,
      items: (quoteData.items as Array<Record<string, unknown>>).map((item) => ({
        productId: item.productId,
        customDetails: item.description,
        quantity: item.quantity,
        rate: item.rate,
        tax: item.tax,
        amount: item.amount || ((item.quantity as number) * (item.rate as number))
      }))
    };
    
    const res = await api.post('/quotations', formattedData);
    return res.data.data;
  },

  deleteQuote: async (id: string) => {
    // Delete quote
    return true;
  },

  // --- DELIVERY CHALLANS MODULE ---
  getChallans: async () => {
    const res = await api.get('/challans');
    return res.data.data;
  },

  createChallan: async (challanData: Record<string, unknown>) => {
    const formattedData = {
      challanNumber: challanData.challanNumber,
      customerId: challanData.clientId,
      challanDate: challanData.issueDate || challanData.challanDate,
      transportMode: challanData.transportMode,
      deliveryLocation: challanData.deliveryLocation,
      euPoWoNumber: challanData.euPoWoNumber,
      termsConditions: challanData.terms,
      items: (challanData.items as Array<Record<string, unknown>>).map((item) => ({
        productId: item.productId,
        customDetails: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount || ((item.quantity as number) * (item.rate as number))
      }))
    };
    
    const res = await api.post('/challans', formattedData);
    return res.data.data;
  },

  updateChallan: async (id: string, data: any) => ({}),

  deleteChallan: async (id: string) => {
    return true;
  },

  // --- INVOICES MODULE ---
  getInvoices: async () => [],
  getInvoiceById: async (id: string) => ({}) as any,
  createInvoice: async (data: any) => ({}),
  updateInvoice: async (id: string, updates: any) => ({}),
  duplicateInvoice: async (id: string): Promise<any> => ({}),

  // --- PAYMENTS MODULE ---
  getPayments: async () => [],
  recordPayment: async (data: any) => ({}),
  refundPayment: async (id: string) => ({}),

  // --- EXPENSES MODULE ---
  getExpenses: async () => [],
  createExpense: async (data: any) => ({}),
  createExpensesBulk: async (data: any[]) => [],
  deleteExpense: async (id: string) => true,

  // --- SALESPERSONS (Used in Quotes) ---
  getSalespersons: async () => [],
  createSalesperson: async (name: string) => [],
  updateQuote: async (id: string, data: any) => ({}),

  // --- PROJECTS EXTRAS ---
  uploadProjectInvoice: async (id: string, invoice: any) => ({}),

  // --- TIME TRACKING ---
  getTimeEntries: async () => [],
  createTimeEntry: async (data: any) => ({}),

  // --- AUDIT LOGS ---
  getAuditLogs: async () => []
};
