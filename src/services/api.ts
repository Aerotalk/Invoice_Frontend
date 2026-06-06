import api from '../lib/axios';

export const apiService = {
  // --- DASHBOARD DATA ---
  getDashboardStats: async () => {
    try {
      const res = await api.get('/dashboard');
      return res.data.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        stats: { totalRevenue: 0, outstandingInvoices: 0, paidInvoicesCount: 0, overdueInvoicesCount: 0 },
        monthlyEarnings: [],
        statusPieData: [],
        clientProfitabilityData: []
      };
    }
  },

  // --- REPORTS MODULE ---
  downloadProjectExcel: async () => {
    const response = await api.get('/export/excel/projects', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Project_Profitability_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
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
      totalBilled: (c.quotations || []).reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0),
      outstandingAmount: (c.quotations || []).reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0),
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
        totalBilled: (client.quotations || []).reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0),
        outstandingAmount: (client.quotations || []).reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0), // Assumes no payments logged yet
      },
      invoices: (client.quotations || []).map((q: any) => ({
        ...q,
        invoiceNumber: q.quoteNumber,
        issueDate: q.quoteDate,
        total: q.totalAmount,
        amountPaid: 0,
        status: q.status
      })),
      payments: [],
      projects: (client.projects || []).map((p: any) => ({
        ...p,
        name: p.projectName,
        status: p.status || 'in-progress',
        progress: p.progress || 0,
        tasks: p.tasks || []
      }))
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
      totalBilled: (v.expenses || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
      outstandingAmount: (v.expenses || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0), // Assuming no payments logged yet
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
      expenses: v.expenses || [] 
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
      status: p.status || 'planning',
      description: p.description || '',
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
    const p = res.data.data;
    return {
      ...p,
      name: p.projectName,
      clientId: p.customerId,
      clientName: p.customer?.displayName || 'Unknown Client',
      vendors: p.vendors?.map((v: any) => v.vendor) || [],
      status: p.status || 'planning',
      description: p.description || '',
      teamMembers: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
      ]
    };
  },

  updateProject: async (id: string, data: unknown) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data.data;
  },

  uploadProjectInvoice: async (id: string, invoiceData: unknown) => {
    const res = await api.post(`/projects/${id}/invoices`, invoiceData);
    return res.data.data;
  },

  // --- QUOTATIONS MODULE ---
  getQuotes: async () => {
    const res = await api.get('/quotations');
    return res.data.data.map((q: any) => ({
      ...q,
      clientName: q.customer?.displayName || 'Unknown Client',
      clientCompany: q.customer?.companyName || 'Unknown Company',
      status: q.status || 'draft',
      total: q.totalAmount || 0,
      issueDate: q.quoteDate,
      items: q.items || [],
    }));
  },

  createQuote: async (quoteData: Record<string, unknown>) => {
    // Send native frontend payload to perfectly match the backend mirrored schema
    const res = await api.post('/quotations', quoteData);
    return res.data.data;
  },

  updateQuote: async (id: string, quoteData: Record<string, unknown>) => {
    const res = await api.put(`/quotations/${id}`, quoteData);
    return res.data.data;
  },

  deleteQuote: async (id: string) => {
    await api.delete(`/quotations/${id}`);
    return true;
  },

  getChallans: async () => {
    const res = await api.get('/challans');
    return res.data.data.map((c: any) => ({
      ...c,
      clientName: c.customer?.displayName || 'Unknown Client',
      clientCompany: c.customer?.companyName || 'Unknown Company',
      status: c.status || 'issued',
      total: c.totalAmount || 0,
    }));
  },

  createChallan: async (challanData: Record<string, unknown>) => {
    // Send payload directly - the backend validator expects these exact fields
    const payload = {
      challanNumber: challanData.challanNumber,
      referenceNumber: challanData.referenceNumber || null,
      clientId: challanData.clientId,
      clientName: challanData.clientName,
      clientCompany: challanData.clientCompany,
      challanDate: challanData.challanDate || challanData.issueDate,
      challanType: challanData.challanType,
      transportMode: challanData.transportMode || null,
      deliveryLocation: challanData.deliveryLocation || null,
      euPoWoNumber: challanData.euPoWoNumber || null,
      items: (challanData.items as Array<Record<string, unknown>>).map((item) => ({
        productId: item.productId && item.productId !== 'custom' ? item.productId : null,
        name: item.name,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        tax: item.tax || null,
        taxAmount: Number(item.taxAmount) || 0,
        amount: Number(item.amount) || Number(item.total) || (Number(item.quantity) * Number(item.rate)),
        total: Number(item.total) || Number(item.amount) || (Number(item.quantity) * Number(item.rate)),
      })),
      subtotal: Number(challanData.subtotal) || 0,
      discountRate: challanData.discountRate !== undefined ? Number(challanData.discountRate) : null,
      discountAmount: challanData.discountAmount !== undefined ? Number(challanData.discountAmount) : null,
      adjustment: challanData.adjustment !== undefined ? Number(challanData.adjustment) : null,
      total: Number(challanData.total) || 0,
      status: challanData.status || 'draft',
      customerNotes: challanData.customerNotes || null,
      terms: challanData.terms || null,
      signatureUrl: challanData.signatureUrl || null,
    };

    const res = await api.post('/challans', payload);
    return res.data.data;
  },

  updateChallan: async (id: string, data: any) => {
    const res = await api.put(`/challans/${id}`, data);
    return res.data.data;
  },

  deleteChallan: async (id: string) => {
    await api.delete(`/challans/${id}`);
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
  getExpenses: async () => {
    const res = await api.get('/expenses');
    return res.data.data;
  },
  createExpense: async (data: any) => {
    const res = await api.post('/expenses', data);
    return res.data.data;
  },
  updateExpense: async (id: string, data: any) => {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data.data;
  },
  createExpensesBulk: async (data: any[]) => {
    const res = await api.post('/expenses/bulk', data);
    return res.data.data;
  },
  deleteExpense: async (id: string) => {
    await api.delete(`/expenses/${id}`);
    return true;
  },

  // --- SALESPERSONS (Used in Quotes) ---
  getSalespersons: async () => [],
  createSalesperson: async (name: string) => [],

  downloadQuotationPdf: async (id: string) => {
    const res = await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
    return res.data;
  },
  downloadChallanPdf: async (id: string) => {
    const res = await api.get(`/challans/${id}/pdf`, { responseType: 'blob' });
    return res.data;
  },

  // --- PROJECTS EXTRAS ---

  getProjectExpenses: async (projectId: string) => {
    const res = await api.get('/expenses');
    const all: any[] = res.data.data || [];
    return all.filter((e: any) => e.projectId === projectId);
  },

  // --- TIME TRACKING ---
  getTimeEntries: async () => [],
  createTimeEntry: async (data: any) => ({}),

  // --- AUDIT LOGS ---
  getAuditLogs: async () => [],

  // --- PURCHASE ORDERS MODULE ---
  getPurchaseOrders: async () => {
    const res = await api.get('/purchase-orders');
    return res.data.data;
  },
  getPurchaseOrderById: async (id: string) => {
    const res = await api.get(`/purchase-orders/${id}`);
    return res.data.data;
  },
  createPurchaseOrder: async (data: any) => {
    const res = await api.post('/purchase-orders', data);
    return res.data.data;
  },
  updatePurchaseOrder: async (id: string, data: any) => {
    const res = await api.put(`/purchase-orders/${id}`, data);
    return res.data.data;
  },
  deletePurchaseOrder: async (id: string) => {
    await api.delete(`/purchase-orders/${id}`);
    return true;
  },
  downloadPurchaseOrderPdf: async (id: string) => {
    const res = await api.get(`/purchase-orders/${id}/pdf`, { responseType: 'blob' });
    return res.data;
  },

  // --- UPLOAD MODULE ---
  uploadFile: async (file: File, folder?: string) => {
    const formData = new FormData();
    if (folder) {
      formData.append('folder', folder);
    }
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  // --- SETTINGS MODULE ---
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data.data;
  },
  updateSettings: async (settingsData: any) => {
    const res = await api.put('/settings', settingsData);
    return res.data.data;
  }
};
