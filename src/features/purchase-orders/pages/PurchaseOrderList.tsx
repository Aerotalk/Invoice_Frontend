import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Trash2, MoreHorizontal, X, Eye, 
  UserSquare2, Calendar, Settings, AlertCircle, Package
} from 'lucide-react';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate, cn } from '../../../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import toast from 'react-hot-toast';

const poSchema = zod.object({
  purchaseOrderId: zod.string().min(2, "PO number is required"),
  vendorId: zod.string().min(1, "Vendor is required"),
  date: zod.string().min(1, "Date is required"),
  dueDate: zod.string(),
  placeOfSupply: zod.string(),
  transportMode: zod.string(),
  deliveryLocation: zod.string(),
  euPoWoNumber: zod.string(),
  projectId: zod.string().optional(),
  termsAndConditions: zod.string(),
});

type PoFormValues = zod.infer<typeof poSchema>;

interface PoItemInput {
  productId: string;
  name: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  price: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export const PurchaseOrderList: React.FC = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [isCustomPoCode, setIsCustomPoCode] = useState(false);
  const [itemRows, setItemRows] = useState<PoItemInput[]>([
    { productId: "", name: "", hsnSac: "", quantity: 1, unit: "Nos", price: 0, taxableAmount: 0, gstRate: 18, gstAmount: 0, total: 0 }
  ]);
  const [globalSearch, setGlobalSearch] = useState("");
  const { currency } = usePreferencesStore();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<PoFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      purchaseOrderId: '',
      vendorId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      placeOfSupply: '19-West Bengal',
      transportMode: '',
      deliveryLocation: '',
      euPoWoNumber: '',
      projectId: '',
      termsAndConditions: 'GST: 18% as mentioned above.\nPayment Terms: 45 Days credit.\nDelivery Time: Urgent.',
    }
  });

  const selectedVendorId = watch("vendorId");

  const loadData = async () => {
    setLoading(true);
    try {
      const [poRes, vendRes, projRes, prodRes] = await Promise.all([
        apiService.getPurchaseOrders().catch(() => []),
        apiService.getVendors().catch(() => []),
        apiService.getProjects().catch(() => []),
        apiService.getProducts().catch(() => [])
      ]);
      
      setPurchaseOrders(poRes);
      setVendors(vendRes);
      setProjects(projRes);
      setProducts(prodRes);

      const nextNum = `GGPL/PO/26-27/${String((poRes.length || 0) + 1).padStart(3, '0')}`;
      setValue("purchaseOrderId", nextNum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recalculations
  const subtotal = itemRows.reduce((sum, item) => sum + item.taxableAmount, 0);
  const taxAmount = itemRows.reduce((sum, item) => sum + item.gstAmount, 0);
  const totalAmount = subtotal + taxAmount;
  const roundOff = Math.round(totalAmount) - totalAmount;
  const finalTotal = Math.round(totalAmount);

  const handleAddRow = () => {
    setItemRows([...itemRows, { productId: "", name: "", hsnSac: "", quantity: 1, unit: "Nos", price: 0, taxableAmount: 0, gstRate: 18, gstAmount: 0, total: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (itemRows.length <= 1) {
      setItemRows([{ productId: "", name: "", hsnSac: "", quantity: 1, unit: "Nos", price: 0, taxableAmount: 0, gstRate: 18, gstAmount: 0, total: 0 }]);
      return;
    }
    setItemRows(itemRows.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index: number, field: keyof PoItemInput, val: any) => {
    const nextRows = [...itemRows];
    const row = nextRows[index];

    if (field === 'productId') {
      const prod = products.find(p => p.id === val);
      if (prod) {
        row.productId = prod.id;
        row.name = prod.name;
        row.hsnSac = prod.hsnCode || '';
        row.price = prod.sellingPrice || 0;
        row.unit = prod.unit || 'Nos';
      } else {
        row.productId = "";
        row.name = "";
        row.hsnSac = "";
        row.price = 0;
      }
    } else {
      (row as any)[field] = val;
    }

    // Recalculate amounts
    row.taxableAmount = Number(row.quantity) * Number(row.price);
    row.gstAmount = row.taxableAmount * (Number(row.gstRate) / 100);
    row.total = row.taxableAmount + row.gstAmount;

    setItemRows(nextRows);
  };

  const onSubmit = async (values: PoFormValues) => {
    const filteredItems = itemRows.filter(r => r.name.trim() !== "");
    if (filteredItems.length === 0) {
      toast.error("Please add at least one item.");
      return;
    }

    try {
      const payload = {
        ...values,
        subtotal,
        taxAmount,
        totalAmount: finalTotal,
        advance: 0,
        balance: finalTotal,
        status: "sent",
        items: filteredItems.map((r, index) => ({
          ...r,
          id: r.productId ? undefined : `poi-${Date.now()}-${index}`, // Optional: adjust ID generation based on your backend
        }))
      };

      if (editId) {
        await apiService.updatePurchaseOrder(editId, payload);
        toast.success("Purchase Order updated successfully!");
      } else {
        await apiService.createPurchaseOrder(payload);
        toast.success("Purchase Order created successfully!");
      }
      
      setDrawerOpen(false);
      setEditId(null);
      reset();
      setItemRows([{ productId: "", name: "", hsnSac: "", quantity: 1, unit: "Nos", price: 0, taxableAmount: 0, gstRate: 18, gstAmount: 0, total: 0 }]);
      loadData();
    } catch (e) {
      console.error(e);
      toast.error(editId ? "Failed to update Purchase Order." : "Failed to save Purchase Order.");
    }
  };

  const openEditDrawer = (po: any) => {
    setEditId(po.id);
    setIsCustomPoCode(true);
    
    // Reset form values
    reset({
      purchaseOrderId: po.purchaseOrderId || '',
      vendorId: po.vendorId || po.vendor?.id || '',
      date: po.date ? new Date(po.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: po.dueDate ? new Date(po.dueDate).toISOString().split('T')[0] : '',
      placeOfSupply: po.placeOfSupply || '',
      transportMode: po.transportMode || '',
      deliveryLocation: po.deliveryLocation || '',
      euPoWoNumber: po.euPoWoNumber || '',
      projectId: po.projectId || po.project?.id || '',
      termsAndConditions: po.termsAndConditions || '',
    });

    // Populate line items
    if (po.items && po.items.length > 0) {
      const formattedItems = po.items.map((item: any) => ({
        productId: item.productId || "",
        name: item.name || "",
        hsnSac: item.hsnSac || "",
        quantity: item.quantity || 1,
        unit: item.unit || "Nos",
        price: item.rate || item.price || 0,
        taxableAmount: item.taxableAmount || 0,
        gstRate: item.gstRate || 18,
        gstAmount: item.gstAmount || 0,
        total: item.total || 0,
      }));
      setItemRows(formattedItems);
    } else {
      setItemRows([{ productId: "", name: "", hsnSac: "", quantity: 1, unit: "Nos", price: 0, taxableAmount: 0, gstRate: 18, gstAmount: 0, total: 0 }]);
    }
    
    setDrawerOpen(true);
    setActiveMenu(null);
  };

  const filteredPOs = purchaseOrders.filter(po => 
    (po.purchaseOrderId || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
    (po.vendor?.name || '').toLowerCase().includes(globalSearch.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      header: "PO Number",
      accessorKey: "purchaseOrderId",
      sortable: true,
      cell: (row) => <span className="font-bold text-primary text-xs">{row.purchaseOrderId}</span>
    },
    {
      header: "Vendor",
      accessorKey: "vendor",
      sortable: true,
      cell: (row) => <span className="font-bold text-foreground text-xs">{row.vendor?.name || row.vendor?.displayName || 'Unknown Vendor'}</span>
    },
    {
      header: "Date",
      accessorKey: "date",
      sortable: true,
      cell: (row) => <span>{formatDate(row.date)}</span>
    },
    {
      header: "Amount",
      accessorKey: "totalAmount",
      sortable: true,
      cell: (row) => <span className="text-xs font-extrabold">{formatCurrency(row.totalAmount, currency)}</span>
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => <StatusBadge status={row.status || 'pending'} />
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="relative select-none">
          <button
            onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition-all select-none cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
          </button>
          
          {activeMenu === row.id && (
            <>
              <div onClick={() => setActiveMenu(null)} className="fixed inset-0 z-40" />
              <div className="absolute right-full -top-8 mr-2 w-44 bg-card border rounded-lg shadow-xl z-50 overflow-hidden divide-y text-xs font-semibold">
                <button
                  type="button"
                  onClick={async () => {
                    setActiveMenu(null);
                    navigate(`/dashboard/purchase-orders/${row.id}`);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground/80 transition-colors text-left"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  View Details & PDF
                </button>
                <button
                  type="button"
                  onClick={() => openEditDrawer(row)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground/80 transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Edit Purchase Order
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete ${row.purchaseOrderId}?`)) {
                      setActiveMenu(null);
                      try {
                        await apiService.deletePurchaseOrder(row.id);
                        toast.success("PO deleted successfully!");
                        loadData();
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition-colors text-left font-semibold shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  Delete PO
                </button>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  const filteredProjects = selectedVendorId 
    ? projects.filter(p => (p.vendors || []).some((pv: any) => pv.vendorId === selectedVendorId || pv.vendor?.id === selectedVendorId || pv.id === selectedVendorId))
    : projects;

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">Purchase Orders</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage purchase orders sent to vendors for goods and services.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search POs..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-64 pl-8 pr-3 py-1.5 border rounded-lg bg-card text-xs font-medium outline-none focus:border-primary shadow-sm hover:border-slate-300 dark:hover:border-slate-800 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            {globalSearch && (
              <button onClick={() => setGlobalSearch("")} className="absolute right-2.5 top-2.5 p-0.5 rounded hover:bg-muted text-muted-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              reset();
              const nextNum = `GGPL/PO/26-27/${String((purchaseOrders.length || 0) + 1).padStart(3, '0')}`;
              setValue("purchaseOrderId", nextNum);
              setItemRows([{ productId: "", name: "", hsnSac: "", quantity: 1, unit: "Nos", price: 0, taxableAmount: 0, gstRate: 18, gstAmount: 0, total: 0 }]);
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add PO
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPOs}
        emptyTitle="No purchase orders found"
        emptyDescription="Create your first purchase order to send to a vendor."
        loading={loading}
      />

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Purchase Order"
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-[82vh] text-xs font-semibold relative">
          <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6 scrollbar-thin">
            
            {/* 1. Vendor & Project */}
            <div className="bg-slate-50/50 dark:bg-slate-900/35 p-4 rounded-xl border space-y-4">
              <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1 border-b pb-2">
                <UserSquare2 className="w-3.5 h-3.5 shrink-0" />
                1. Order Details
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Vendor (Order To) <span className="text-rose-500">*</span></label>
                  <select
                    {...register("vendorId")}
                    className={cn("w-full px-3 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary appearance-none", errors.vendorId ? "border-rose-500/70" : "")}
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name || v.displayName}</option>
                    ))}
                  </select>
                  {errors.vendorId && <span className="text-[9px] text-rose-500">{errors.vendorId.message}</span>}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Ordered For (Project)</label>
                  <select
                    {...register("projectId")}
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary appearance-none"
                  >
                    <option value="">Direct Purchase</option>
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name || p.projectName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Order Codes & Transportation */}
            <div className="bg-card p-4 rounded-xl border space-y-4">
              <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1 border-b pb-2">
                <Package className="w-3.5 h-3.5 shrink-0" />
                2. Codes & Logistics
              </span>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Order No. <span className="text-rose-500">*</span></label>
                  <div className="flex rounded-lg overflow-hidden border">
                    <input
                      type="text"
                      disabled={!isCustomPoCode}
                      {...register("purchaseOrderId")}
                      className="w-full px-3 py-2 bg-card outline-none focus:border-primary text-xs font-semibold disabled:bg-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomPoCode(!isCustomPoCode)}
                      className={cn("px-3 border-l flex items-center justify-center transition-colors hover:bg-muted text-slate-500", isCustomPoCode ? "text-primary bg-primary/5" : "")}
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Date <span className="text-rose-500">*</span></label>
                  <input type="date" {...register("date")} className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs" />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Due Date</label>
                  <input type="date" {...register("dueDate")} className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Place of Supply</label>
                  <input type="text" {...register("placeOfSupply")} className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Transport Mode</label>
                  <input type="text" placeholder="e.g. Road" {...register("transportMode")} className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">Delivery Location</label>
                  <input type="text" placeholder="e.g. Kolkata" {...register("deliveryLocation")} className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">EU PO/WO Number</label>
                  <input type="text" placeholder="e.g. WO-0909" {...register("euPoWoNumber")} className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs" />
                </div>
              </div>
            </div>

            {/* 3. Items Table */}
            <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b">
                <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  3. Line Items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[20%]">Item Name</th>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[10%]">HSN/SAC</th>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[8%]">Qty</th>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[8%]">Unit</th>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[12%]">Price/Unit</th>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[12%]">Taxable Amt</th>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[8%]">GST %</th>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[12%]">Total</th>
                      <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[10%] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {itemRows.map((row, index) => (
                      <tr key={index} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="p-2">
                          {row.productId ? (
                            <span className="text-xs font-bold px-2 py-1.5 block">{row.name}</span>
                          ) : (
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => handleRowChange(index, "name", e.target.value)}
                              placeholder="Type item name..."
                              className="w-full px-2 py-1.5 border border-transparent rounded bg-transparent outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary text-xs font-semibold"
                            />
                          )}
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.hsnSac}
                            onChange={(e) => handleRowChange(index, "hsnSac", e.target.value)}
                            className="w-full px-2 py-1.5 border border-transparent rounded bg-transparent outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                            className="w-full px-2 py-1.5 border border-transparent rounded bg-transparent outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary text-xs font-bold font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.unit}
                            onChange={(e) => handleRowChange(index, "unit", e.target.value)}
                            className="w-full px-2 py-1.5 border border-transparent rounded bg-transparent outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={row.price}
                            onChange={(e) => handleRowChange(index, "price", e.target.value)}
                            className="w-full px-2 py-1.5 border border-transparent rounded bg-transparent outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary text-xs font-bold font-mono"
                          />
                        </td>
                        <td className="p-2 text-xs font-bold font-mono">{formatCurrency(row.taxableAmount, currency)}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={row.gstRate}
                            onChange={(e) => handleRowChange(index, "gstRate", e.target.value)}
                            className="w-full px-2 py-1.5 border border-transparent rounded bg-transparent outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary text-xs font-bold font-mono"
                          />
                        </td>
                        <td className="p-2 text-xs font-bold font-mono text-primary">{formatCurrency(row.total, currency)}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t bg-muted/20">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border shadow-sm text-xs font-bold hover:bg-muted transition-colors active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  Add Custom Item
                </button>
              </div>
            </div>

            {/* Terms and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-card p-4 rounded-xl border">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px] mb-2 block flex items-center gap-1">
                    Terms & Conditions <AlertCircle className="w-3 h-3 text-slate-400" />
                  </label>
                  <textarea
                    {...register("termsAndConditions")}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50/50 outline-none focus:border-primary text-xs font-medium resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-slate-50/80 dark:bg-slate-900/40 p-5 rounded-xl border shadow-inner">
                  <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider border-b pb-2 mb-4">Financial Summary</h4>
                  <div className="space-y-3 text-xs font-semibold text-foreground/80">
                    <div className="flex justify-between items-center">
                      <span>Sub Total</span>
                      <span className="font-bold font-mono">{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-600 dark:text-amber-500">
                      <span>Total GST</span>
                      <span className="font-bold font-mono">+{formatCurrency(taxAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3 mt-3">
                      <span>Round Off</span>
                      <span className="font-bold font-mono">{formatCurrency(roundOff, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-extrabold text-foreground pt-1">
                      <span>Total Amount</span>
                      <span className="font-mono">{formatCurrency(finalTotal, currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t flex justify-end gap-3 mt-auto shrink-0 bg-background">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-5 py-2 rounded-lg border text-xs font-bold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Save Purchase Order
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
