import React, { useState } from 'react';
import {
  Upload,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  FileSpreadsheet,
  RefreshCw,
  Search,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';

interface OnlineOrderImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRowResult {
  rowNumber: number;
  orderNumber: string;
  action: 'update' | 'create' | 'no_change' | 'invalid';
  existingOrder?: Order;
  updates?: Partial<Order>;
  newOrder?: Order;
  diffs: string[];
  errorMessage?: string;
  customerSummary: string;
  totalAmount?: number;
}

export const OnlineOrderImportModal: React.FC<OnlineOrderImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { orders, upsertOrdersFromCsv, addToast } = useStore();

  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRowResult[]>([]);
  const [filterAction, setFilterAction] = useState<'all' | 'update' | 'create' | 'invalid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const resetModalState = () => {
    setStep('upload');
    setFileName('');
    setParsedRows([]);
    setFilterAction('all');
    setSearchQuery('');
    setIsApplying(false);
    setDragActive(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      resetModalState();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  if (!isOpen) return null;

  // --- 1. DOWNLOAD SAMPLE CSV TEMPLATE ---
  const downloadSampleTemplate = () => {
    const headers = [
      'order_number',
      'status',
      'tracking_number',
      'courier',
      'customer_name',
      'customer_phone',
      'customer_email',
      'address',
      'district',
      'state',
      'pincode',
      'item_name',
      'quantity',
      'price',
      'total',
      'payment_status',
      'notes',
    ].join(',');

    // Sample Row 1: Update existing order (only specify order_number and the fields to change)
    const row1 = [
      '7S-2026-1001',
      'Shipped',
      'TRK8848276403',
      'Speed Post',
      '',
      '',
      '',
      '',
      'Ernakulam',
      'Kerala',
      '',
      '',
      '',
      '',
      '',
      'Paid',
      'Dispatched in 5-ply corrugated carton',
    ].join(',');

    // Sample Row 2: Create a new order (provide full details)
    const row2 = [
      '7S-2026-9042',
      'Order Placed',
      '',
      'DTDC',
      'Arun Kumar',
      '9876543210',
      'arunkumar@gmail.com',
      '14 Palm Grove Road',
      'Kozhikode',
      'Kerala',
      '673001',
      'Triple Air-Purifying Trio',
      '1',
      '899',
      '899',
      'Paid',
      'Live plant gift order',
    ].join(',');

    const csvContent = `${headers}\n${row1}\n${row2}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '7seasons_online_orders_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'Template Downloaded',
      message: 'Use 7seasons_online_orders_template.csv as your guide.',
      type: 'info',
    });
  };

  // --- 2. CSV PARSER & ROW EVALUATOR ---
  const handleProcessCsvText = (text: string, originalFileName: string) => {
    try {
      // Parse CSV handling quotes and newlines
      const rawRows: string[][] = [];
      let quote = false;
      let col = 0;
      let row = 0;

      for (let c = 0; c < text.length; c++) {
        const cc = text[c];
        const nc = text[c + 1];
        rawRows[row] = rawRows[row] || [];
        rawRows[row][col] = rawRows[row][col] || '';

        if (cc === '"' && quote && nc === '"') {
          rawRows[row][col] += cc;
          c++;
          continue;
        }
        if (cc === '"') {
          quote = !quote;
          continue;
        }
        if (cc === ',' && !quote) {
          col++;
          continue;
        }
        if (cc === '\r' && nc === '\n' && !quote) {
          row++;
          col = 0;
          c++;
          continue;
        }
        if (cc === '\n' && !quote) {
          row++;
          col = 0;
          continue;
        }
        if (cc === '\r' && !quote) {
          row++;
          col = 0;
          continue;
        }
        rawRows[row][col] += cc;
      }

      if (rawRows.length < 2) {
        throw new Error('CSV file is empty or contains no data rows.');
      }

      const headers = rawRows[0].map((h) => h.trim().toLowerCase().replace(/[\s_-]+/g, ''));

      const results: ParsedRowResult[] = [];

      for (let i = 1; i < rawRows.length; i++) {
        const values = rawRows[i];
        if (!values || values.length === 0 || (values.length === 1 && !values[0].trim())) {
          continue; // skip completely blank lines
        }

        const getValue = (keys: string[]): string => {
          for (const k of keys) {
            const normKey = k.toLowerCase().replace(/[\s_-]+/g, '');
            const idx = headers.findIndex((h) => h === normKey || h.includes(normKey));
            if (idx !== -1 && values[idx] !== undefined) {
              const val = values[idx].trim();
              if (val) return val;
            }
          }
          return '';
        };

        // Strict Mandatory Order Number Check
        const rawOrderNumber = getValue([
          'ordernumber',
          'order_number',
          'order',
          'order#',
          'orderid',
        ]);

        if (!rawOrderNumber) {
          results.push({
            rowNumber: i + 1,
            orderNumber: '—',
            action: 'invalid',
            diffs: [],
            errorMessage: 'Missing mandatory order_number field in row.',
            customerSummary: getValue(['customername', 'name']) || 'Unknown',
          });
          continue;
        }

        const orderNumber = rawOrderNumber;
        const cleanOrderNumber = orderNumber.toUpperCase();

        // Check if existing order matches
        const existing = orders.find(
          (o) =>
            o.orderNumber.toUpperCase() === cleanOrderNumber ||
            o.id.toUpperCase() === cleanOrderNumber
        );

        const statusVal = getValue(['status', 'orderstatus', 'order_status']);
        const trackingVal = getValue(['tracking', 'trackingnumber', 'tracking_number', 'awb', 'consignment']);
        const courierVal = getValue(['courier', 'courierpartner', 'courier_partner', 'carrier', 'shippingpartner']);
        const notesVal = getValue(['notes', 'note', 'remarks', 'adminnote']);
        const phoneVal = getValue(['phone', 'phonenumber', 'phone_number', 'mobile', 'contact']);
        const emailVal = getValue(['email', 'customeremail', 'mail']);
        const nameVal = getValue(['customername', 'name', 'customer']);
        const addrVal = getValue(['address', 'addressline1', 'street', 'shippingaddress']);
        const distVal = getValue(['district', 'city']);
        const stateVal = getValue(['state']);
        const pinVal = getValue(['pincode', 'pin', 'postalcode', 'zip']);
        const payStatusVal = getValue(['paymentstatus', 'payment_status', 'payment']);

        if (existing) {
          // --- CASE A: MATCHED EXISTING ORDER -> UPDATE IN-PLACE ---
          const updates: Partial<Order> = {};
          const diffs: string[] = [];

          if (statusVal && statusVal !== existing.orderStatus) {
            updates.orderStatus = statusVal as OrderStatus;
            diffs.push(`Status: ${existing.orderStatus} ➔ ${statusVal}`);
            updates.statusHistory = [
              ...(existing.statusHistory || []),
              {
                status: statusVal as OrderStatus,
                timestamp: new Date().toISOString(),
                note: notesVal || `Status updated via CSV import (${statusVal})`,
              },
            ];
          }

          if (trackingVal && trackingVal !== existing.trackingNumber) {
            updates.trackingNumber = trackingVal;
            diffs.push(`Tracking AWB: ${trackingVal}`);
          }

          if (courierVal && courierVal !== existing.courierPartner) {
            updates.courierPartner = courierVal;
            diffs.push(`Courier: ${courierVal}`);
          }

          if (notesVal && notesVal !== existing.notes) {
            updates.notes = notesVal;
            diffs.push(`Note added`);
          }

          if (payStatusVal && payStatusVal.toLowerCase() !== (existing.paymentStatus || '').toLowerCase()) {
            const normPay = payStatusVal.toLowerCase() === 'paid' ? 'paid' : 'pending';
            updates.paymentStatus = normPay as any;
            diffs.push(`Payment: ${normPay}`);
          }

          // Customer field diffs
          const custUpdates: any = {};
          if (nameVal && nameVal !== existing.customer?.name) {
            custUpdates.name = nameVal;
            diffs.push(`Name: ${nameVal}`);
          }
          if (phoneVal && phoneVal !== existing.customer?.phone) {
            custUpdates.phone = phoneVal;
            diffs.push(`Phone: ${phoneVal}`);
          }
          if (emailVal && emailVal !== existing.customer?.email) {
            custUpdates.email = emailVal;
            diffs.push(`Email: ${emailVal}`);
          }

          // Address field diffs
          const addrUpdates: any = {};
          const curAddr = existing.shippingAddress || existing.customer?.shippingAddress;
          if (addrVal && addrVal !== curAddr?.addressLine1) {
            addrUpdates.addressLine1 = addrVal;
            diffs.push(`Address Line: ${addrVal}`);
          }
          if (distVal && distVal !== curAddr?.district) {
            addrUpdates.district = distVal;
            addrUpdates.city = distVal;
            diffs.push(`District: ${distVal}`);
          }
          if (stateVal && stateVal !== curAddr?.state) {
            addrUpdates.state = stateVal;
            diffs.push(`State: ${stateVal}`);
          }
          if (pinVal && pinVal !== curAddr?.pincode) {
            addrUpdates.pincode = pinVal;
            diffs.push(`PIN: ${pinVal}`);
          }

          if (Object.keys(custUpdates).length > 0) {
            updates.customer = {
              ...existing.customer,
              ...custUpdates,
            };
          }

          if (Object.keys(addrUpdates).length > 0) {
            updates.shippingAddress = {
              ...(curAddr || {}),
              ...addrUpdates,
            } as any;
          }

          const hasChanges = Object.keys(updates).length > 0;

          results.push({
            rowNumber: i + 1,
            orderNumber,
            action: hasChanges ? 'update' : 'no_change',
            existingOrder: existing,
            updates: hasChanges ? updates : undefined,
            diffs: hasChanges ? diffs : ['All fields identical to current database values'],
            customerSummary: existing.customer?.name || nameVal || 'Customer',
            totalAmount: existing.total,
          });
        } else {
          // --- CASE B: ORDER NUMBER NOT IN DATABASE -> CREATE NEW ONLINE ORDER ---
          const itemName = getValue(['item', 'itemname', 'product', 'items', 'plant']) || 'Botanical Selection';
          const itemPrice = Number(getValue(['price', 'itemprice', 'rate'])) || 0;
          const itemQty = Number(getValue(['quantity', 'qty'])) || 1;
          const totalVal =
            Number(getValue(['total', 'totalamount', 'amount'])) ||
            (itemPrice > 0 ? itemPrice * itemQty : 0);

          const finalCustName = nameVal || 'Online Customer';
          const finalPhone = phoneVal || '';
          const finalEmail = emailVal || 'customer@example.com';
          const finalDist = distVal || 'Kerala';
          const finalState = stateVal || 'Kerala';
          const finalPin = pinVal || '';
          const finalStatus = (statusVal || 'Order Placed') as OrderStatus;
          const finalPayStatus = payStatusVal.toLowerCase() === 'pending' ? 'pending' : 'paid';

          const newOrderObj: Order = {
            id: `ord-imp-${Date.now()}-${i}`,
            orderNumber: orderNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'online',
            customer: {
              name: finalCustName,
              phone: finalPhone,
              email: finalEmail,
              shippingAddress: {
                id: `addr-${Date.now()}-${i}`,
                fullName: finalCustName,
                phoneNumber: finalPhone,
                addressLine1: addrVal || 'Doorstep Delivery',
                city: finalDist,
                district: finalDist,
                state: finalState,
                pincode: pinVal,
              },
            },
            shippingAddress: {
              id: `addr-${Date.now()}-${i}`,
              fullName: finalCustName,
              phoneNumber: finalPhone,
              addressLine1: addrVal || 'Doorstep Delivery',
              city: finalDist,
              district: finalDist,
              state: finalState,
              pincode: pinVal,
            },
            items: [
              {
                id: `item-${Date.now()}-${i}`,
                type: 'product',
                name: itemName,
                slug: itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                price: itemPrice || totalVal,
                quantity: itemQty,
                image: '/logo.png',
              },
            ],
            subtotal: totalVal,
            discount: 0,
            deliveryFee: 0,
            total: totalVal,
            orderStatus: finalStatus,
            paymentStatus: finalPayStatus as any,
            paymentMethod: 'razorpay',
            trackingNumber: trackingVal || undefined,
            courierPartner: courierVal || undefined,
            notes: notesVal || undefined,
            statusHistory: [
              {
                status: finalStatus,
                timestamp: new Date().toISOString(),
                note: notesVal || 'Imported into Online Orders via CSV',
              },
            ],
          };

          const createDiffs = [
            `New order registered with #${orderNumber}`,
            `Status: ${finalStatus}`,
          ];
          if (trackingVal) createDiffs.push(`Tracking: ${trackingVal}`);
          if (courierVal) createDiffs.push(`Courier: ${courierVal}`);
          if (totalVal > 0) createDiffs.push(`Total: ₹${totalVal}`);

          results.push({
            rowNumber: i + 1,
            orderNumber,
            action: 'create',
            newOrder: newOrderObj,
            diffs: createDiffs,
            customerSummary: `${finalCustName} (${finalDist})`,
            totalAmount: totalVal,
          });
        }
      }

      setFileName(originalFileName);
      setParsedRows(results);
      setStep('preview');
    } catch (err: any) {
      console.error('[CSV Parse Error]:', err);
      addToast({
        title: 'CSV Parsing Error',
        message: err.message || 'Could not parse the provided CSV file.',
        type: 'error',
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        handleProcessCsvText(text, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.type.includes('csv'))) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        if (typeof text === 'string') {
          handleProcessCsvText(text, file.name);
        }
      };
      reader.readAsText(file);
    } else {
      addToast({
        title: 'Invalid File',
        message: 'Please upload a standard .csv file format.',
        type: 'warning',
      });
    }
  };

  // --- 3. APPLY UPSERT ---
  const handleApplyImport = async () => {
    const ordersToUpdate = parsedRows
      .filter((r) => r.action === 'update' && r.existingOrder && r.updates)
      .map((r) => ({
        orderId: r.existingOrder!.id,
        updates: r.updates!,
      }));

    const ordersToCreate = parsedRows
      .filter((r) => r.action === 'create' && r.newOrder)
      .map((r) => r.newOrder!);

    if (ordersToUpdate.length === 0 && ordersToCreate.length === 0) {
      addToast({
        title: 'No Changes to Apply',
        message: 'All parsed rows were already identical or invalid.',
        type: 'info',
      });
      return;
    }

    try {
      setIsApplying(true);
      const result = await upsertOrdersFromCsv(ordersToUpdate, ordersToCreate);

      addToast({
        title: 'Orders Processed Successfully 🌿',
        message: `Updated ${result.updatedCount} existing order(s) and created ${result.createdCount} new order(s).`,
        type: 'success',
      });

      handleClose();
    } catch (err: any) {
      console.error('[Apply Import Error]:', err);
      addToast({
        title: 'Failed to Save Changes',
        message: err.message || 'An error occurred while updating Firestore database.',
        type: 'error',
      });
    } finally {
      setIsApplying(false);
    }
  };

  // Metrics count
  const updateCount = parsedRows.filter((r) => r.action === 'update').length;
  const createCount = parsedRows.filter((r) => r.action === 'create').length;
  const noChangeCount = parsedRows.filter((r) => r.action === 'no_change').length;
  const invalidCount = parsedRows.filter((r) => r.action === 'invalid').length;

  const filteredRows = parsedRows.filter((r) => {
    if (filterAction !== 'all' && r.action !== filterAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrder = r.orderNumber.toLowerCase().includes(q);
      const matchCust = r.customerSummary.toLowerCase().includes(q);
      const matchDiff = r.diffs.some((d) => d.toLowerCase().includes(q));
      return matchOrder || matchCust || matchDiff;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 border border-gray-200 shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
                <span>Import & Update Online Orders (CSV)</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Upsert Engine
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Matches by Order Number to update existing orders, or creates new online orders if not found.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isApplying}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: UPLOAD & DOWNLOAD TEMPLATE */}
        {step === 'upload' && (
          <div className="py-6 space-y-6 overflow-y-auto flex-1">
            {/* Explanatory Banner */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-1">
                <h4 className="font-bold">How Order Matching Works:</h4>
                <p className="text-emerald-900/80 leading-relaxed">
                  1. <strong className="text-emerald-950">Mandatory Order Number:</strong> Every row must include an <code className="bg-emerald-100/70 px-1 py-0.5 rounded font-mono font-bold">order_number</code> (e.g. 7S-2026-1042).<br/>
                  2. <strong className="text-emerald-950">If Order Exists:</strong> Updates only the specified columns (Tracking AWB, Courier, Status, Address, Phone) without touching remaining fields.<br/>
                  3. <strong className="text-emerald-950">If Order Does Not Exist:</strong> Automatically creates a new online order using that exact Order Number.
                </p>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-emerald-600 bg-emerald-50/60 scale-[1.01]'
                  : 'border-gray-200 bg-gray-50/50 hover:border-emerald-400 hover:bg-emerald-50/30'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center text-emerald-700">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  Drag & Drop your CSV file here, or{' '}
                  <label
                    htmlFor="online-orders-csv-file-input"
                    className="text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer font-black"
                  >
                    browse files
                  </label>
                </p>
                <p className="text-xs text-gray-500 mt-1">Accepts standard .csv comma-separated spreadsheet files</p>
              </div>
              <input
                id="online-orders-csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* Template Download Section */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">Need the exact CSV format?</span>
                <span className="text-[11px] text-gray-500">
                  Download a pre-filled sample spreadsheet with all supported column headers.
                </span>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template (.CSV)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & REVIEW OF PARSED ROWS */}
        {step === 'preview' && (
          <div className="py-4 space-y-4 overflow-y-auto flex-1 flex flex-col">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div
                onClick={() => setFilterAction(filterAction === 'update' ? 'all' : 'update')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  filterAction === 'update'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-gray-50/50 hover:bg-emerald-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">To Update</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-xl font-black text-emerald-950 mt-1">{updateCount}</div>
                <span className="text-[10px] text-gray-500">Existing orders modified</span>
              </div>

              <div
                onClick={() => setFilterAction(filterAction === 'create' ? 'all' : 'create')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  filterAction === 'create'
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                    : 'border-gray-200 bg-gray-50/50 hover:bg-blue-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">To Create</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </div>
                <div className="text-xl font-black text-blue-950 mt-1">{createCount}</div>
                <span className="text-[10px] text-gray-500">New orders added</span>
              </div>

              <div
                onClick={() => setFilterAction('all')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  filterAction === 'all'
                    ? 'border-gray-400 bg-gray-100 ring-2 ring-gray-400/20'
                    : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">No Change</span>
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                </div>
                <div className="text-xl font-black text-gray-900 mt-1">{noChangeCount}</div>
                <span className="text-[10px] text-gray-500">Already up-to-date</span>
              </div>

              <div
                onClick={() => setFilterAction(filterAction === 'invalid' ? 'all' : 'invalid')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  filterAction === 'invalid'
                    ? 'border-rose-600 bg-rose-50 ring-2 ring-rose-500/20'
                    : 'border-gray-200 bg-gray-50/50 hover:bg-rose-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Invalid</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                </div>
                <div className="text-xl font-black text-rose-900 mt-1">{invalidCount}</div>
                <span className="text-[10px] text-gray-500">Missing Order Number</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 pt-1">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parsed preview by Order #, Customer, or Details..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 text-xs rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer px-2 py-1"
                >
                  Choose Different File
                </button>
              </div>
            </div>

            {/* Parsed Rows Table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden flex-1 min-h-[240px] max-h-[380px] overflow-y-auto bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50/80 sticky top-0 border-b border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-500 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Order Number</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Customer / Amount</th>
                    <th className="py-2.5 px-3">Details / Changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No rows found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((r, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors hover:bg-gray-50/60 ${
                          r.action === 'invalid'
                            ? 'bg-rose-50/30'
                            : r.action === 'create'
                            ? 'bg-blue-50/20'
                            : r.action === 'update'
                            ? 'bg-emerald-50/20'
                            : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-gray-400 font-mono text-[11px]">{r.rowNumber}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-950">
                          {r.orderNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          {r.action === 'update' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <RefreshCw className="w-2.5 h-2.5" />
                              Update Existing
                            </span>
                          )}
                          {r.action === 'create' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              <PlusCircle className="w-2.5 h-2.5" />
                              Create New
                            </span>
                          )}
                          {r.action === 'no_change' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              No Change
                            </span>
                          )}
                          {r.action === 'invalid' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Invalid (Skipped)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-emerald-950 block">{r.customerSummary}</span>
                          {r.totalAmount !== undefined && (
                            <span className="text-[10px] text-gray-500">₹{r.totalAmount}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {r.errorMessage ? (
                            <span className="text-rose-600 font-medium text-[11px]">
                              {r.errorMessage}
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {r.diffs.map((d, dIdx) => (
                                <span
                                  key={dIdx}
                                  className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded font-medium text-gray-700 shadow-2xs"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <div>
            {step === 'preview' && (
              <span className="text-xs text-gray-500">
                File: <strong className="text-emerald-950">{fileName}</strong> ({parsedRows.length} total rows)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isApplying}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            {step === 'preview' && (
              <button
                type="button"
                onClick={handleApplyImport}
                disabled={isApplying || (updateCount === 0 && createCount === 0)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-900 hover:to-green-800 text-white rounded-full text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Applying Upsert to Firestore...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>
                      Apply Changes ({updateCount} Updates, {createCount} New)
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
