import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Image as ImageIcon, 
  MoreHorizontal, 
  Sparkles, 
  Upload, 
  X, 
  ChevronDown, 
  Check, 
  Package, 
  Layers, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { cn } from '../../../lib/utils';

// Zod schema designed to prevent input/output type conflicts
const productSchema = zod.object({
  name: zod.string().min(2, { message: "Item name must be at least 2 characters" }),
  type: zod.enum(['goods', 'service']),
  unit: zod.string().min(1, { message: "Unit is required" }),
  hsnCode: zod.string().optional(),
  taxPreference: zod.string().min(1, { message: "Tax Preference is required" }),
  intraStateTaxRate: zod.string().optional(),
  interStateTaxRate: zod.string().optional(),
  sellingPrice: zod.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a positive number"
  }),
  description: zod.string()
});

type ProductFormValues = zod.infer<typeof productSchema>;

export const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeProductMenu, setActiveProductMenu] = useState<string | null>(null);
  
  // Custom unit dropdown state
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock Upload image state
  const [selectedMockImage, setSelectedMockImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Quick search input state
  const [globalSearch, setGlobalSearch] = useState("");

  const { currency } = usePreferencesStore();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      type: 'goods',
      unit: '',
      hsnCode: '',
      taxPreference: 'Taxable',
      intraStateTaxRate: '',
      interStateTaxRate: '',
      sellingPrice: '0',
      description: ''
    }
  });

  const selectedUnitValue = watch("unit");
  const selectedType = watch("type");

  // Load products and units
  const loadData = async () => {
    setLoading(true);
    try {
      const prodRes = await apiService.getProducts();
      const unitRes = await apiService.getProductUnits();
      setProducts(prodRes);
      setUnits(unitRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle click outside unit dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUnitDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter units list based on search query
  const filteredUnits = units.filter(u => 
    u.toLowerCase().includes(unitSearchQuery.toLowerCase())
  );

  // Add custom unit dynamically
  const handleAddCustomUnit = async () => {
    const trimmed = unitSearchQuery.trim();
    if (!trimmed) return;
    
    // Check if it already exists (case-insensitive)
    const exists = units.some(u => u.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      // Find the existing one and select it
      const matched = units.find(u => u.toLowerCase() === trimmed.toLowerCase()) || trimmed;
      setValue("unit", matched);
      setUnitSearchQuery("");
      setUnitDropdownOpen(false);
      return;
    }

    const nextUnits = [...units, trimmed];
    setUnits(nextUnits);
    setValue("unit", trimmed);
    setUnitSearchQuery("");
    setUnitDropdownOpen(false);

    try {
      await apiService.saveProductUnits(nextUnits);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete unit option dynamically
  const handleDeleteUnitOption = async (event: React.MouseEvent, unitToDelete: string) => {
    event.stopPropagation(); // Avoid selecting the unit when clicking delete
    
    if (confirm(`Are you sure you want to delete the unit "${unitToDelete}"?`)) {
      const nextUnits = units.filter(u => u !== unitToDelete);
      setUnits(nextUnits);
      
      // Clear value if the selected unit is being deleted
      if (selectedUnitValue === unitToDelete) {
        setValue("unit", "");
      }

      try {
        await apiService.saveProductUnits(nextUnits);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Mock upload action
  const handleMockUploadImage = () => {
    setIsUploading(true);
    setTimeout(() => {
      const mockImages = [
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150", // Wooden shipping crate
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150", // Modern white watch
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150", // Headphones
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150", // Red athletic sneakers
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=150"  // Premium sunglasses
      ];
      const selected = mockImages[Math.floor(Math.random() * mockImages.length)];
      setSelectedMockImage(selected);
      setIsUploading(false);
    }, 800);
  };

  const handleClearSelectedImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMockImage(null);
  };

  // Submit product
  const onSubmitProduct = async (values: ProductFormValues) => {
    try {
      const payload = {
        name: values.name,
        type: values.type,
        unit: values.unit,
        hsnCode: values.hsnCode,
        taxPreference: values.taxPreference,
        intraStateTaxRate: values.intraStateTaxRate,
        interStateTaxRate: values.interStateTaxRate,
        sellingPrice: Number(values.sellingPrice),
        description: values.description,
        imageUrl: selectedMockImage || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=150" // default fallback
      };

      await apiService.createProduct(payload);
      alert("Product profile added successfully!");
      setDrawerOpen(false);
      reset();
      setSelectedMockImage(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Failed to save product details.");
    }
  };

  // Filter products by global search input
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    p.description.toLowerCase().includes(globalSearch.toLowerCase()) ||
    p.unit.toLowerCase().includes(globalSearch.toLowerCase())
  );

  // Table Columns Setup
  const columns: ColumnDef<any>[] = [
    {
      header: "Product / Service",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3 select-none">
          <img 
            src={row.imageUrl || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=150"} 
            alt={row.name} 
            className="w-10 h-10 rounded-lg object-cover border ring-1 ring-border shadow-sm shrink-0" 
          />
          <div>
            <span className="block text-xs font-bold text-foreground hover:text-primary transition-colors">
              {row.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5 tracking-wide flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400 shrink-0" />
              {row.unit}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
      cell: (row) => (
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border select-none",
          row.type === 'goods' 
            ? "text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50" 
            : "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50"
        )}>
          {row.type}
        </span>
      )
    },
    {
      header: "Selling Price",
      accessorKey: "sellingPrice",
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-bold text-foreground select-none">
          {formatCurrency(row.sellingPrice, currency)}
        </span>
      )
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (row) => (
        <p className="text-xs text-muted-foreground/90 font-medium truncate max-w-xs select-none">
          {row.description || "No description recorded."}
        </p>
      )
    },
    {
      header: "Date Added",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => <span>{formatDate(row.createdAt)}</span>
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="relative select-none">
          <button
            onClick={() => setActiveProductMenu(activeProductMenu === row.id ? null : row.id)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition-all select-none cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
          </button>
          
          {activeProductMenu === row.id && (
            <>
              <div 
                onClick={() => setActiveProductMenu(null)}
                className="fixed inset-0 z-40 select-none" 
              />
              <div className="absolute right-full -top-8 mr-2 w-40 bg-card border rounded-lg shadow-xl z-50 overflow-hidden divide-y text-xs font-semibold select-none">
                <button
                  type="button"
                  onClick={async () => {
                    setActiveProductMenu(null);
                    alert(`Product Details:\nName: ${row.name}\nType: ${row.type}\nUnit: ${row.unit}\nSelling Price: ${formatCurrency(row.sellingPrice, currency)}\nDescription: ${row.description || "N/A"}`);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground/80 transition-colors text-left"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Quick View
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete the product "${row.name}"?`)) {
                      setActiveProductMenu(null);
                      try {
                        await apiService.deleteProduct(row.id);
                        alert("Product item deleted successfully!");
                        loadData();
                      } catch (err) {
                        console.error(err);
                        alert("Failed to delete product.");
                      }
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors text-left font-semibold cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  Delete Item
                </button>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Search and Action Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">Products & Services</h2>
          <p className="text-xs text-muted-foreground mt-1">Configure inventories, map corporate services, set sales pricing, and optimize transaction items.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Custom Search in Items bar exactly matching Zoho style */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search in Items ( / )"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-64 pl-8 pr-3 py-1.5 border rounded-lg bg-card text-xs font-medium outline-none focus:border-primary shadow-sm hover:border-slate-300 dark:hover:border-slate-800 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            {globalSearch && (
              <button 
                onClick={() => setGlobalSearch("")} 
                className="absolute right-2.5 top-2.5 p-0.5 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              reset();
              setSelectedMockImage(null);
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95 select-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Main Products Datatable */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        emptyTitle="No items found"
        emptyDescription="Get started by clicking Add Product to register inventory goods or business services."
        loading={loading}
      />

      {/* Advanced High-Fidelity Add Item Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Item"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmitProduct)} className="flex flex-col h-[82vh] text-xs font-semibold select-none relative">
          
          <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6 scrollbar-thin">
            
            {/* Header / Basic Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Product details inputs */}
              <div className="md:col-span-2 space-y-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Cloud Server Subscription"
                    {...register("name")}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium",
                      errors.name ? "border-rose-500/70" : ""
                    )}
                  />
                  {errors.name && <span className="text-[9px] text-rose-500 font-bold">{errors.name.message}</span>}
                </div>

                {/* Goods vs Service Type Radio Block */}
                <div className="flex flex-col gap-2">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Type
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-foreground text-xs select-none">
                      <input
                        type="radio"
                        value="goods"
                        checked={selectedType === 'goods'}
                        onChange={() => setValue("type", "goods")}
                        className="w-4 h-4 text-primary bg-slate-100 border-slate-300 dark:border-slate-800 focus:ring-primary accent-primary"
                      />
                      <span>Goods</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-foreground text-xs select-none">
                      <input
                        type="radio"
                        value="service"
                        checked={selectedType === 'service'}
                        onChange={() => setValue("type", "service")}
                        className="w-4 h-4 text-primary bg-slate-100 border-slate-300 dark:border-slate-800 focus:ring-primary accent-primary"
                      />
                      <span>Service</span>
                    </label>
                  </div>
                </div>

                {/* Unit Dynamic Search / Select Dropdown */}
                <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Unit
                  </label>
                  
                  <div 
                    onClick={() => setUnitDropdownOpen(!unitDropdownOpen)}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg bg-card flex items-center justify-between cursor-pointer select-none border-slate-200 dark:border-slate-800",
                      errors.unit ? "border-rose-500/70" : "",
                      unitDropdownOpen ? "border-primary ring-1 ring-primary/45" : ""
                    )}
                  >
                    <span className={cn(
                      "text-xs font-semibold truncate",
                      selectedUnitValue ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {selectedUnitValue || "Select or type to add"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                  {errors.unit && <span className="text-[9px] text-rose-500 font-bold">{errors.unit.message}</span>}

                  {/* High-Fidelity Floating Selectable Options Sheet */}
                  {unitDropdownOpen && (
                    <div className="absolute top-full left-0 z-[100] mt-1.5 w-full bg-card border rounded-lg shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-56 divide-y border-slate-200 dark:border-slate-800">
                      
                      {/* Search option input */}
                      <div className="p-2 bg-slate-50/50 dark:bg-slate-900/40 relative flex gap-1 items-center shrink-0">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Search or add custom..."
                            value={unitSearchQuery}
                            onChange={(e) => setUnitSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomUnit();
                              }
                            }}
                            className="w-full pl-7 pr-3 py-1.5 border rounded bg-card outline-none text-[11px] font-semibold focus:border-primary"
                          />
                          <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>

                        {unitSearchQuery.trim() && (
                          <button
                            type="button"
                            onClick={handleAddCustomUnit}
                            className="px-2.5 py-1.5 rounded bg-primary text-white text-[10px] font-bold active:scale-95 shrink-0"
                          >
                            Add
                          </button>
                        )}
                      </div>

                      {/* Options listing list */}
                      <div className="flex-1 overflow-y-auto space-y-0.5 py-1 scrollbar-thin select-none max-h-40">
                        {filteredUnits.map((u) => (
                          <div
                            key={u}
                            onClick={() => {
                              setValue("unit", u);
                              setUnitDropdownOpen(false);
                              setUnitSearchQuery("");
                            }}
                            className={cn(
                              "px-3 py-2 hover:bg-muted text-[11px] font-semibold transition-colors flex items-center justify-between cursor-pointer",
                              selectedUnitValue === u ? "bg-primary/5 text-primary font-bold" : "text-foreground"
                            )}
                          >
                            <span className="truncate">{u}</span>
                            <div className="flex items-center gap-1.5">
                              {selectedUnitValue === u && <Check className="w-3 h-3 text-primary shrink-0" />}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteUnitOption(e, u)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                              >
                                <Trash2 className="w-3 h-3 shrink-0" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {filteredUnits.length === 0 && (
                          <div className="p-3 text-center text-muted-foreground text-[11px]">
                            {unitSearchQuery.trim() ? (
                              <button
                                type="button"
                                onClick={handleAddCustomUnit}
                                className="text-primary hover:underline font-bold"
                              >
                                Add "{unitSearchQuery}" as custom unit
                              </button>
                            ) : (
                              "No units available"
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                {/* HSN Code */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    HSN Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("hsnCode")}
                      className="w-full pl-3 pr-8 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium"
                    />
                    <Search className="w-3.5 h-3.5 text-primary absolute right-3 top-2.5 cursor-pointer" />
                  </div>
                </div>

                {/* Tax Preference */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Tax Preference <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("taxPreference")}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-semibold cursor-pointer appearance-none",
                      errors.taxPreference ? "border-rose-500/70" : ""
                    )}
                  >
                    <option value="Taxable">Taxable</option>
                    <option value="Non-Taxable">Non-Taxable</option>
                    <option value="Out of Scope">Out of Scope</option>
                    <option value="Non-GST Supply">Non-GST Supply</option>
                  </select>
                  {errors.taxPreference && <span className="text-[9px] text-rose-500 font-bold">{errors.taxPreference.message}</span>}
                </div>

              </div>

              {/* Image drag upload mockup box */}
              <div className="flex flex-col justify-start">
                <span className="text-muted-foreground font-bold tracking-wide uppercase text-[10px] mb-1.5">Item Image</span>
                
                <div 
                  onClick={handleMockUploadImage}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all h-40 bg-slate-50/20 dark:bg-slate-900/10 hover:bg-slate-50/50 dark:hover:bg-slate-900/30",
                    selectedMockImage ? "border-primary/50 relative overflow-hidden" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  {selectedMockImage ? (
                    <>
                      <img 
                        src={selectedMockImage} 
                        alt="Product upload preview" 
                        className="w-full h-full object-cover rounded-lg absolute inset-0 z-0" 
                      />
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          type="button"
                          onClick={handleClearSelectedImage}
                          className="p-1 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow-md transition-colors"
                        >
                          <X className="w-3 h-3 shrink-0" />
                        </button>
                      </div>
                    </>
                  ) : isUploading ? (
                    <div className="space-y-2 select-none animate-pulse">
                      <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border shrink-0 text-slate-400">
                        <ImageIcon className="w-5 h-5 shrink-0" />
                      </div>
                      <span className="block text-[10px] font-bold text-foreground mt-2">Drag image(s) here or</span>
                      <span className="block text-[10px] text-primary hover:underline mt-0.5">Browse images</span>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Sales Information Category */}
            <div className="bg-slate-50/40 dark:bg-slate-900/10 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 space-y-5">
              <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                Sales Information
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Selling Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Selling Price <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex shadow-sm rounded-lg overflow-hidden border">
                    <span className="px-3 bg-slate-100 dark:bg-slate-900 border-r flex items-center justify-center font-bold text-slate-500 shrink-0 select-none">
                      {currency}
                    </span>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...register("sellingPrice")}
                      className={cn(
                        "w-full px-3 py-2 bg-card outline-none focus:border-primary text-xs font-semibold",
                        errors.sellingPrice ? "border-rose-500/70" : ""
                      )}
                    />
                  </div>
                  {errors.sellingPrice && <span className="text-[9px] text-rose-500 font-bold">{errors.sellingPrice.message}</span>}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter sales description..."
                    {...register("description")}
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium resize-none h-[42px] leading-relaxed"
                  />
                </div>

              </div>
            </div>

            {/* Default Tax Rates Category */}
            <div className="bg-slate-50/40 dark:bg-slate-900/10 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 space-y-5">
              <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                Default Tax Rates
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Intra State Tax Rate */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Intra State Tax Rate
                  </label>
                  <select
                    {...register("intraStateTaxRate")}
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a Tax</option>
                    <option value="GST0 [0%]">GST0 [0%]</option>
                    <option value="GST5 [5%]">GST5 [5%]</option>
                    <option value="GST12 [12%]">GST12 [12%]</option>
                    <option value="GST18 [18%]">GST18 [18%]</option>
                    <option value="GST28 [28%]">GST28 [28%]</option>
                    <option value="GST40 [40%]">GST40 [40%]</option>
                  </select>
                </div>

                {/* Inter State Tax Rate */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-bold tracking-wide uppercase text-[10px]">
                    Inter State Tax Rate
                  </label>
                  <select
                    {...register("interStateTaxRate")}
                    className="w-full px-3 py-2 border rounded-lg bg-card outline-none focus:border-primary text-xs font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a Tax</option>
                    <option value="IGST0 [0%]">IGST0 [0%]</option>
                    <option value="IGST5 [5%]">IGST5 [5%]</option>
                    <option value="IGST12 [12%]">IGST12 [12%]</option>
                    <option value="IGST18 [18%]">IGST18 [18%]</option>
                    <option value="IGST28 [28%]">IGST28 [28%]</option>
                    <option value="IGST40 [40%]">IGST40 [40%]</option>
                  </select>
                </div>

              </div>
            </div>

          </div>

          {/* Drawer Actions Footer */}
          <div className="border-t pt-4 flex items-center justify-between bg-card z-10 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Saves to local workspace</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95"
              >
                Save Item
              </button>
            </div>
          </div>

        </form>
      </Drawer>

    </div>
  );
};
