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
    return res.data.data;
  },

  getClientById: async (id: string) => {
    const res = await api.get(`/clients/${id}`);
    const client = res.data.data;
    // Adapt the nested relation format from Prisma
    return {
      client: client,
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
    return res.data.data;
  },

  getVendorById: async (id: string) => {
    const res = await api.get(`/vendors/${id}`);
    return { vendor: res.data.data, expenses: [] };
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
    return res.data.data;
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
    return res.data.data;
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

  deleteQuote: async () => {
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

  deleteChallan: async () => {
    return true;
  },

  // Unused Modules (Left empty for future)
  getInvoices: async () => [],
  createInvoice: async () => ({}),
  getPayments: async () => [],
  getExpenses: async () => [],
  getTimeEntries: async () => [],
  getAuditLogs: async () => []
};
