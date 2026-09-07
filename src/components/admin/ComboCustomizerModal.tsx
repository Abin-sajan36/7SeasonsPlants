import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Package,
  Layers,
  Sparkles,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Check,
  ToggleLeft,
  ToggleRight,
  Info,
  Tag,
  Leaf,
  Box,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { PlantCombo, ComboItem, Product } from '../../types';
import { ImageUploadPicker, compressImageFile } from './ImageUploadPicker';

interface ComboCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  comboToEdit: PlantCombo | null;
  products: Product[];
  onSaveCombo: (combo: PlantCombo) => void;
}

const DEFAULT_CATEGORIES = [
  'Air Purifying Combos',
  'Starter Pack & Beginners',
  'Balcony Garden Combos',
  'Low Light Living Combos',
  'Bedroom Oxygen Boosters',
  'Flowering & Ornamental',
  'Office Desk Combos',
  'Rare & Exotic Bundles',
];

const PRESET_ACCESSORIES: Array<{
  name: string;
  itemType: ComboItem['itemType'];
  priceShare: number;
  image: string;
  notes: string;
}> = [
  {
    name: 'Matte Finish Planters with Drainage (Set of 3)',
    itemType: 'pot',
    priceShare: 249,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
    notes: 'Premium lightweight ceramic-finish pots with matching saucers',
  },
  {
    name: '7Seasons Illustrated Kerala Plant Care Handbook',
    itemType: 'guide',
    priceShare: 99,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    notes: 'Comprehensive Malayalam & English tropical plant guide',
  },
  {
    name: '7Seasons Organic Bloom Booster Bio-Fertilizer (500g)',
    itemType: 'fertilizer',
    priceShare: 149,
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
    notes: '100% natural slow-release compost nutrient blend',
  },
  {
    name: 'Pure Brass Botanical Water Mister',
    itemType: 'accessory',
    priceShare: 299,
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=80',
    notes: 'Fine-droplet misting nozzle for tropical humidity',
  },
];

export const ComboCustomizerModal: React.FC<ComboCustomizerModalProps> = ({
  isOpen,
  onClose,
  comboToEdit,
  products,
  onSaveCombo,
}) => {
  if (!isOpen) return null;

  // Form State
  const [name, setName] = useState(comboToEdit?.name || '');
  const [slug, setSlug] = useState(comboToEdit?.slug || '');
  const [category, setCategory] = useState(comboToEdit?.category || 'Air Purifying Combos');
  const [customCategory, setCustomCategory] = useState('');
  const [shortDescription, setShortDescription] = useState(
    comboToEdit?.shortDescription || 'Curated tropical nursery bundle with matched plants and planters.'
  );
  const [description, setDescription] = useState(
    comboToEdit?.description ||
      'Carefully paired at Mannarathayil Nursery for synchronized care rhythms, lush greenery, and effortless indoor styling. Shipped in sturdy 5-ply cartons directly across Kerala & Tamil Nadu.'
  );
  const [price, setPrice] = useState<number>(comboToEdit?.price || 599);
  const [originalPrice, setOriginalPrice] = useState<number>(comboToEdit?.originalPrice || 899);
  const [stock, setStock] = useState<number>(comboToEdit?.stock ?? 25);
  const [sku, setSku] = useState(comboToEdit?.sku || `7S-CMB-${Math.floor(1000 + Math.random() * 9000)}`);
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled'>(
    comboToEdit?.status || 'published'
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(comboToEdit?.isFeatured ?? true);
  const [images, setImages] = useState<string[]>(
    comboToEdit?.images?.length
      ? comboToEdit.images
      : ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80']
  );
  const [careSummary, setCareSummary] = useState(
    comboToEdit?.careSummary ||
      'Position in bright to moderate indirect sunlight. Water individually when topsoil feels dry.'
  );
  const [deliveryInfo, setDeliveryInfo] = useState(
    comboToEdit?.deliveryInfo ||
      'Shipped in reinforced 5-ply ventilated nursery crates with 100% damage protection across Kerala & Tamil Nadu.'
  );

  // Items State (What is in and not in the combo)
  const [items, setItems] = useState<ComboItem[]>(
    comboToEdit?.items?.length
      ? comboToEdit.items
      : [
          {
            productId: products[0]?.id || 'prod-default',
            productName: products[0]?.name || 'Golden Pothos (Money Plant)',
            productSlug: products[0]?.slug || 'golden-pothos',
            quantity: 1,
            image: products[0]?.images[0] || 'https://images.unsplash.com/photo-1596724855577-62a225a07c06?auto=format&fit=crop&w=400&q=80',
            itemType: 'plant',
            priceShare: products[0]?.price || 249,
            notes: 'Lush tropical potted specimen',
          },
        ]
  );

  // Benefits
  const [benefits, setBenefits] = useState<string[]>(
    comboToEdit?.benefits?.length
      ? comboToEdit.benefits
      : [
          'Filters household toxins & boosts indoor oxygen',
          'Synchronized watering rhythms for effortless care',
          'Packed in specialized 5-ply ventilated protective carton',
          'Includes complimentary nursery care guide',
        ]
  );
  const [newBenefitInput, setNewBenefitInput] = useState('');

  // UI Tabs & Modals within customizer
  const [activeSubTab, setActiveSubTab] = useState<'items' | 'general' | 'images' | 'pricing' | 'benefits'>('items');
  const [plantSearchQuery, setPlantSearchQuery] = useState('');
  const [isAddPlantDropdownOpen, setIsAddPlantDropdownOpen] = useState(false);

  // Custom Item Drawer/Form
  const [isAddingCustomItem, setIsAddingCustomItem] = useState(false);
  const [customItemForm, setCustomItemForm] = useState<{
    name: string;
    itemType: ComboItem['itemType'];
    quantity: number;
    priceShare: number;
    image: string;
    notes: string;
  }>({
    name: '',
    itemType: 'plant',
    quantity: 1,
    priceShare: 199,
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
    notes: '',
  });

  // Calculate stats
  const calculatedItemsTotalValue = items.reduce(
    (sum, it) => sum + (it.priceShare || 0) * (it.quantity || 1),
    0
  );
  const totalPlantCount = items.filter((it) => it.itemType === 'plant').reduce((s, it) => s + it.quantity, 0);
  const totalOtherCount = items.filter((it) => it.itemType !== 'plant').reduce((s, it) => s + it.quantity, 0);

  const savingsAmount = Math.max(0, originalPrice - price);
  const discountPercent = originalPrice > 0 ? Math.round((savingsAmount / originalPrice) * 100) : 0;

  // Auto slug generator on name change
  const handleNameChange = (val: string) => {
    setName(val);
    if (!comboToEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  // Add product from store to items
  const handleAddProductToCombo = (prod: Product) => {
    const existingIdx = items.findIndex((it) => it.productId === prod.id);
    if (existingIdx > -1) {
      // Increment quantity
      const updated = [...items];
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: updated[existingIdx].quantity + 1,
      };
      setItems(updated);
    } else {
      const newItem: ComboItem = {
        productId: prod.id,
        productName: prod.name,
        productSlug: prod.slug,
        quantity: 1,
        image: prod.images[0] || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
        itemType: 'plant',
        priceShare: prod.price,
        notes: prod.botanicalName ? `Botanical: ${prod.botanicalName}` : 'Nursery specimen',
      };
      setItems([...items, newItem]);
    }
    setIsAddPlantDropdownOpen(false);
    setPlantSearchQuery('');
  };

  // Add preset accessory to combo
  const handleAddPresetAccessory = (preset: (typeof PRESET_ACCESSORIES)[0]) => {
    const newItem: ComboItem = {
      productId: `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productName: preset.name,
      quantity: 1,
      image: preset.image,
      itemType: preset.itemType,
      priceShare: preset.priceShare,
      notes: preset.notes,
    };
    setItems([...items, newItem]);
  };

  // Add custom item
  const handleSaveCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemForm.name.trim()) return;

    const newItem: ComboItem = {
      productId: `item-${Date.now()}`,
      productName: customItemForm.name.trim(),
      quantity: Number(customItemForm.quantity) || 1,
      image: customItemForm.image || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
      itemType: customItemForm.itemType,
      priceShare: Number(customItemForm.priceShare) || 0,
      notes: customItemForm.notes.trim() || undefined,
    };

    setItems([...items, newItem]);
    setIsAddingCustomItem(false);
    setCustomItemForm({
      name: '',
      itemType: 'plant',
      quantity: 1,
      priceShare: 199,
      image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
      notes: '',
    });
  };

  // Remove item from combo
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item quantity
  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    if (newQty < 1) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...items];
    updated[index] = { ...updated[index], quantity: newQty };
    setItems(updated);
  };

  // Update item field
  const handleUpdateItemField = (index: number, field: keyof ComboItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Upload image for specific item
  const handleUploadItemImage = async (index: number, file: File) => {
    try {
      const dataUrl = await compressImageFile(file);
      handleUpdateItemField(index, 'image', dataUrl);
    } catch (err) {
      console.error('Failed to compress item image:', err);
    }
  };

  // Benefit handlers
  const handleAddBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBenefitInput.trim()) return;
    setBenefits([...benefits, newBenefitInput.trim()]);
    setNewBenefitInput('');
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  // Auto-sync Original Price with calculated total value of items
  const handleAutoSyncOriginalPrice = () => {
    if (calculatedItemsTotalValue > 0) {
      setOriginalPrice(calculatedItemsTotalValue);
    }
  };

  // Save Combo Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please provide a name for this combo.');
      return;
    }

    if (items.length === 0) {
      alert('Please include at least one item or plant in this combo bundle.');
      return;
    }

    const finalCategory = customCategory.trim() || category;
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const finalCombo: PlantCombo = {
      id: comboToEdit ? comboToEdit.id : `combo-${Date.now()}`,
      name: name.trim(),
      slug: finalSlug,
      category: finalCategory,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      price: Number(price),
      originalPrice: Number(originalPrice || calculatedItemsTotalValue || price),
      savings: Math.max(0, (Number(originalPrice) || Number(price)) - Number(price)),
      discountPercentage: discountPercent,
      stock: Number(stock),
      sku: sku.trim() || `7S-CMB-${Math.floor(1000 + Math.random() * 9000)}`,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'],
      rating: comboToEdit?.rating || 4.9,
      reviewCount: comboToEdit?.reviewCount || 18,
      isFeatured,
      tags: comboToEdit?.tags || ['combo', 'bundle', 'nursery', 'kerala'],
      items,
      careSummary: careSummary.trim(),
      benefits: benefits.length > 0 ? benefits : ['High air purification', 'Specialized safe packing'],
      deliveryInfo: deliveryInfo.trim(),
      status,
      createdAt: comboToEdit?.createdAt || new Date().toISOString(),
    };

    onSaveCombo(finalCombo);
    onClose();
  };

  const filteredCatalogProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(plantSearchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(plantSearchQuery.toLowerCase()) ||
      (p.botanicalName && p.botanicalName.toLowerCase().includes(plantSearchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header Bar */}
        <div className="bg-gradient-to-r from-[#062416] via-[#0A2618] to-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between gap-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shadow-2xs border border-white/10">
              <Layers className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7F3D0] bg-white/10 px-2 py-0.5 rounded-md">
                  Combo Builder & Customizer
                </span>
                <span className="text-[10px] text-[#D1FAE5]/70">
                  {comboToEdit ? `Editing ID: ${comboToEdit.id}` : 'Creating New Combo'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {name || 'Untitled Plant Combo Bundle'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Sub-navigation */}
        <div className="bg-emerald-50/70 px-5 sm:px-6 py-2.5 border-b border-gray-200 flex gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'items', label: `Items in Combo (${items.length})`, icon: Package, badge: `${totalPlantCount} plants` },
            { id: 'general', label: 'General Info & Category', icon: Info },
            { id: 'images', label: `Images & Gallery (${images.length})`, icon: ImageIcon },
            { id: 'pricing', label: `Pricing & Stock (Save ₹${savingsAmount})`, icon: DollarSign },
            { id: 'benefits', label: `Benefits & Highlights (${benefits.length})`, icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] bg-white/20 text-current px-1.5 py-0.2 rounded-full ml-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: COMBO ITEMS (WHAT IS AND IS NOT IN THE COMBO) */}
          {activeSubTab === 'items' && (
            <div className="space-y-6">
              {/* Header Box & Summary */}
              <div className="bg-[#EAE6DB]/40 p-4 sm:p-5 rounded-2xl border border-[#4A3E31]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#4A3E31] text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#7D8F69]" />
                    <span>Included Plants, Planters & Accessories</span>
                  </h3>
                  <p className="text-xs text-[#736758] mt-0.5">
                    Customize exactly what plants and companion items belong in this bundle.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-white rounded-xl border border-[#4A3E31]/10 text-xs text-right">
                    <span className="text-[10px] text-[#736758] block">Combined Item Value</span>
                    <span className="font-black text-[#4A3E31]">₹{calculatedItemsTotalValue}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoSyncOriginalPrice}
                    className="px-3 py-1.5 bg-[#7D8F69] hover:bg-[#627252] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                    title="Set Combo MRP to total sum of items"
                  >
                    Sync MRP (₹{calculatedItemsTotalValue})
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add from Catalog vs Add Custom Item vs Presets */}
              <div className="flex flex-wrap gap-2.5">
                {/* 1. Add Plant from Catalog Button with Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAddPlantDropdownOpen(!isAddPlantDropdownOpen)}
                    className="px-4 py-2 bg-[#7D8F69] hover:bg-[#627252] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Leaf className="w-3.5 h-3.5" />
                    <span>+ Add Nursery Plant to Combo</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {isAddPlantDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#4A3E31]/15 p-3 z-30 space-y-2 animate-in fade-in zoom-in-95">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#736758] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={plantSearchQuery}
                          onChange={(e) => setPlantSearchQuery(e.target.value)}
                          placeholder="Search plant by name, botanical name..."
                          className="w-full pl-8.5 pr-3 py-1.5 bg-[#EAE6DB]/40 text-[#4A3E31] text-xs font-semibold rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto divide-y divide-[#4A3E31]/10 space-y-1">
                        {filteredCatalogProducts.length === 0 ? (
                          <p className="text-xs text-[#736758] p-3 text-center">No plants match your search.</p>
                        ) : (
                          filteredCatalogProducts.map((prod) => (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => handleAddProductToCombo(prod)}
                              className="w-full p-2 hover:bg-[#EBF0E6] rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  className="w-9 h-9 rounded-lg object-cover bg-[#FAF9F6] shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-xs text-[#4A3E31] group-hover:text-[#7D8F69]">
                                    {prod.name}
                                  </p>
                                  <p className="text-[10px] text-[#736758] italic">{prod.botanicalName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-xs text-[#4A3E31]">₹{prod.price}</span>
                                <span className="text-[10px] text-[#7D8F69] block font-bold">+ Add</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Add Custom Item (Pots, Soil, Accessories) */}
                <button
                  type="button"
                  onClick={() => setIsAddingCustomItem(true)}
                  className="px-4 py-2 bg-[#FAF9F6] hover:bg-[#EAE6DB] text-[#4A3E31] rounded-full text-xs font-bold border border-[#4A3E31]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Custom Accessory / Planter</span>
                </button>
              </div>

              {/* Quick Preset Accessories Chips */}
              <div className="p-3 bg-white rounded-2xl border border-[#4A3E31]/10 space-y-2">
                <span className="text-[11px] font-bold text-[#4A3E31] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A082]" />
                  <span>Quick-Add Popular Nursery Companions:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ACCESSORIES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPresetAccessory(preset)}
                      className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#EBF0E6] text-[#4A3E31] rounded-xl text-xs font-semibold border border-[#4A3E31]/15 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>+ {preset.name}</span>
                      <span className="text-[10px] text-[#7D8F69] font-bold">(₹{preset.priceShare})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Item Form Modal / Drawer if open */}
              {isAddingCustomItem && (
                <div className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-[#7D8F69] space-y-4 shadow-sm animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#4A3E31]/10 pb-2">
                    <h4 className="font-bold text-xs text-[#4A3E31]">Add Custom Item to Bundle</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomItem(false)}
                      className="text-gray-400 hover:text-gray-700 text-xs"
                    >
                      ✕ Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-[#4A3E31] block mb-1">Item Title *</label>
                      <input
                        type="text"
                        required
                        value={customItemForm.name}
                        onChange={(e) =>
                          setCustomItemForm({ ...customItemForm, name: e.target.value })
                        }
                        placeholder="e.g. Ceramic Planter, Coco-Peat Block 1kg"
                        className="w-full px-3 py-2 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-xl border border-[#4A3E31]/15 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#4A3E31] block mb-1">Item Type</label>
                      <select
                        value={customItemForm.itemType}
                        onChange={(e) =>
                          setCustomItemForm({
                            ...customItemForm,
                            itemType: e.target.value as ComboItem['itemType'],
                          })
                        }
                        className="w-full px-3 py-2 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-xl border border-[#4A3E31]/15 outline-hidden font-semibold"
                      >
                        <option value="plant">Plant Specimen</option>
                        <option value="pot">Planter / Pot</option>
                        <option value="fertilizer">Fertilizer / Soil</option>
                        <option value="guide">Care Guide Handbook</option>
                        <option value="accessory">Accessory / Tool</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-[#4A3E31] block mb-1">Quantity in Bundle</label>
                      <input
                        type="number"
                        min="1"
                        value={customItemForm.quantity}
                        onChange={(e) =>
                          setCustomItemForm({
                            ...customItemForm,
                            quantity: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-xl border border-[#4A3E31]/15 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#4A3E31] block mb-1">Individual Value (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={customItemForm.priceShare}
                        onChange={(e) =>
                          setCustomItemForm({
                            ...customItemForm,
                            priceShare: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-xl border border-[#4A3E31]/15 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#4A3E31] block mb-1">Image URL / Data</label>
                      <input
                        type="text"
                        value={customItemForm.image}
                        onChange={(e) =>
                          setCustomItemForm({ ...customItemForm, image: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-xl border border-[#4A3E31]/15 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomItem(false)}
                      className="px-4 py-1.5 bg-[#FAF9F6] text-[#4A3E31] rounded-full text-xs font-bold border border-[#4A3E31]/20 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCustomItem}
                      className="px-4 py-1.5 bg-[#7D8F69] text-white rounded-full text-xs font-bold cursor-pointer"
                    >
                      Add Item to Bundle
                    </button>
                  </div>
                </div>
              )}

              {/* Items List Table / Cards */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#4A3E31] block">
                  Current Items in this Bundle ({items.length}):
                </span>

                {items.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#4A3E31]/20 text-[#736758] space-y-2">
                    <Package className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs font-semibold">No items currently in this combo.</p>
                    <p className="text-[11px]">Use "+ Add Nursery Plant to Combo" above to add items.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#4A3E31]/10 bg-white rounded-2xl border border-[#4A3E31]/15 overflow-hidden shadow-2xs">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F6] transition-colors"
                      >
                        {/* Item Photo & Details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Image Thumbnail with change file upload */}
                          <div className="relative group shrink-0">
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-12 h-12 rounded-xl object-cover bg-[#FAF9F6] border border-[#4A3E31]/10"
                            />
                            <label
                              title="Upload custom photo for this item"
                              className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleUploadItemImage(idx, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <input
                                type="text"
                                value={item.productName}
                                onChange={(e) =>
                                  handleUpdateItemField(idx, 'productName', e.target.value)
                                }
                                className="font-bold text-xs text-[#4A3E31] bg-transparent hover:bg-[#EAE6DB]/40 px-1 py-0.5 rounded-sm border-b border-transparent focus:border-[#7D8F69] outline-hidden max-w-xs"
                              />
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                  item.itemType === 'plant'
                                    ? 'bg-[#EBF0E6] text-[#7D8F69]'
                                    : item.itemType === 'pot'
                                    ? 'bg-amber-100 text-amber-800'
                                    : item.itemType === 'fertilizer'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {item.itemType}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) =>
                                  handleUpdateItemField(idx, 'notes', e.target.value)
                                }
                                placeholder="Notes (e.g. 5-inch nursery pot)"
                                className="text-[11px] text-[#736758] bg-transparent hover:bg-[#EAE6DB]/40 px-1 py-0.5 rounded-sm border-b border-transparent focus:border-[#7D8F69] outline-hidden w-full max-w-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Quantity, Item Value & Delete Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#4A3E31]/10">
                          {/* Quantity Counter */}
                          <div className="flex items-center border border-[#4A3E31]/15 rounded-full bg-[#FAF9F6] p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(idx, item.quantity - 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-white text-[#4A3E31] cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-[#4A3E31]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(idx, item.quantity + 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-white text-[#4A3E31] cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          {/* Value in ₹ */}
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-[#736758]">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={item.priceShare || 0}
                              onChange={(e) =>
                                handleUpdateItemField(idx, 'priceShare', Number(e.target.value))
                              }
                              className="w-16 px-2 py-1 bg-[#EAE6DB]/40 text-xs font-bold text-[#4A3E31] rounded-lg border border-[#4A3E31]/15 text-right outline-hidden"
                            />
                          </div>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            title="Remove from combo"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GENERAL INFO & CATEGORY */}
          {activeSubTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#4A3E31] block mb-1">Combo Bundle Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Oxygen Booster Trio Bundle"
                    className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4A3E31] block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="oxygen-booster-trio-bundle"
                    className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#4A3E31] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden font-semibold"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="custom">-- Custom Category --</option>
                  </select>
                </div>

                {category === 'custom' && (
                  <div>
                    <label className="font-bold text-[#4A3E31] block mb-1">Custom Category Name</label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Kerala Monsoon Specials"
                      className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-full border border-[#4A3E31]/15 outline-hidden font-semibold"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-[#4A3E31] block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden font-semibold"
                  >
                    <option value="published">Published (Live in Store)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4A3E31] block mb-1">Short Description / Subtitle</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="e.g. 3 hardy indoor purifiers paired with matching terracotta pots."
                  className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-[#4A3E31] block mb-1">Detailed Botanical Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the aesthetic, plant varieties, suitability, and grower notes..."
                  className="w-full p-4 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-2xl border border-[#4A3E31]/15 focus:bg-white outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#4A3E31]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#7D8F69]"
                  />
                  <span>Feature on Homepage & Featured Carousel</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGES & GALLERY (WITH DEVICE FILE UPLOAD) */}
          {activeSubTab === 'images' && (
            <div className="space-y-4">
              <ImageUploadPicker
                images={images}
                onChange={(imgs) => setImages(imgs)}
                maxImages={8}
                label="Combo Gallery Photos"
                helpText="Upload images from your computer/device files (JPEG, PNG, WEBP) or paste web URLs. The first image will be used as the primary cover photo."
              />
            </div>
          )}

          {/* TAB 4: PRICING & STOCK */}
          {activeSubTab === 'pricing' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-[#4A3E31] block mb-1">
                    Combo Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] text-sm font-black rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4A3E31] block mb-1">
                    Original / Separate Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] text-sm font-semibold rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4A3E31] block mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden font-semibold"
                  />
                </div>
              </div>

              {/* Economic Calculation Box */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase text-emerald-900 block">
                    Calculated Customer Savings:
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-emerald-950">
                      Save ₹{savingsAmount}
                    </span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {discountPercent}% OFF
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#736758]">
                  <span>Total Value of Items in pack: </span>
                  <strong className="text-[#4A3E31]">₹{calculatedItemsTotalValue}</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4A3E31] block mb-1">SKU Code</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 5: BENEFITS & CARE */}
          {activeSubTab === 'benefits' && (
            <div className="space-y-6 text-xs">
              <div className="space-y-3">
                <label className="font-bold text-[#4A3E31] block">
                  Combo Highlights & Benefits Bullet Points ({benefits.length})
                </label>

                {/* Add new benefit input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefitInput}
                    onChange={(e) => setNewBenefitInput(e.target.value)}
                    placeholder="e.g. NASA Approved Air Purifying foliage"
                    className="flex-1 px-4 py-2 bg-[#EAE6DB]/40 text-[#4A3E31] text-xs font-semibold rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-4 py-2 bg-[#7D8F69] text-white rounded-full font-bold hover:bg-[#627252] cursor-pointer shrink-0"
                  >
                    + Add Bullet
                  </button>
                </div>

                {/* List of benefits */}
                <div className="space-y-2">
                  {benefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white rounded-xl border border-[#4A3E31]/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 text-[#4A3E31] font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#7D8F69] shrink-0" />
                        <span>{b}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4A3E31] block mb-1">
                  Synchronized Care Summary
                </label>
                <textarea
                  rows={2}
                  value={careSummary}
                  onChange={(e) => setCareSummary(e.target.value)}
                  className="w-full p-3 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-2xl border border-[#4A3E31]/15 focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-[#4A3E31] block mb-1">
                  Delivery & 5-Ply Packaging Guarantee
                </label>
                <input
                  type="text"
                  value={deliveryInfo}
                  onChange={(e) => setDeliveryInfo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#EAE6DB]/40 text-[#4A3E31] rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-5 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-gray-500">
              <span>Combo Price: </span>
              <strong className="text-base font-black text-emerald-950">₹{price}</strong>
              <span className="ml-2 text-rose-600 font-bold">(Save ₹{savingsAmount})</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{comboToEdit ? 'Save Changes' : 'Create Plant Combo'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
