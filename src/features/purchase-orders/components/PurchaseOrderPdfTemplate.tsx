import React from 'react';
import { formatDate, formatCurrency } from '../../../lib/utils';

interface PoItem {
  name: string;
  hsnSac?: string;
  quantity: number;
  unit?: string;
  price?: number;
  rate?: number;
  taxableAmount?: number;
  gstRate?: number;
  gstAmount?: number;
  total: number;
}

interface PurchaseOrderPdfTemplateProps {
  po: {
    purchaseOrderId: string;
    date: string;
    dueDate?: string;
    deliveryDate?: string;
    placeOfSupply?: string;
    transportMode?: string;
    deliveryLocation?: string;
    euPoWoNumber?: string;
    termsAndConditions?: string;
    subtotal: number;
    taxAmount?: number;
    gstAmount?: number;
    totalAmount: number;
    advance?: number;
    balance?: number;
    vendor?: {
      name?: string;
      displayName?: string;
      phone?: string;
      gstNumber?: string;
      billingAddress?: {
        street1?: string;
        street2?: string;
        city?: string;
        state?: string;
        zip?: string;
        phone?: string;
      };
    };
    forProject?: {
      name?: string;
    };
    items?: PoItem[];
  };
  currency: string;
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees only';
  
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const formatTenth = (n: number) => {
    if (n === 0) return '';
    if (n < 10) return single[n];
    if (n < 20) return double[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
  };
  
  let words = '';
  
  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  
  const hundred = Math.floor(rem / 100);
  rem %= 100;
  
  const ten = rem;
  
  if (crore > 0) {
    words += numberToWords(crore).replace(' Rupees only', '') + ' Crore ';
  }
  if (lakh > 0) {
    words += formatTenth(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += formatTenth(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += single[hundred] + ' Hundred ';
  }
  if (ten > 0) {
    if (words !== '') words += 'and ';
    words += formatTenth(ten) + ' ';
  }
  
  // Capitalize first letter and return
  const result = words.trim() + ' Rupees only';
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export const PurchaseOrderPdfTemplate: React.FC<PurchaseOrderPdfTemplateProps> = ({ po, currency }) => {
  const items: PoItem[] = po.items || [];
  
  // Totals calculations
  const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalTaxable = po.subtotal || items.reduce((sum, item) => sum + (Number(item.taxableAmount) || (Number(item.quantity) * (Number(item.price) || Number(item.rate) || 0))), 0);
  const totalTax = po.taxAmount || po.gstAmount || items.reduce((sum, item) => sum + (Number(item.gstAmount) || 0), 0);
  const totalAmount = po.totalAmount || (totalTaxable + totalTax);
  const roundOff = Math.round(totalAmount) - (totalTaxable + totalTax);
  const finalTotal = Math.round(totalAmount);
  
  const advance = po.advance || 0;
  const balance = finalTotal - advance;

  // Determine place of supply and GST split
  const isWestBengal = (po.placeOfSupply || '').toLowerCase().includes('west bengal') || (po.placeOfSupply || '').includes('19');
  
  // Group tax rates for tax breakdown
  // We want to calculate the CGST/SGST/IGST splits
  const cgstAmount = isWestBengal ? totalTax / 2 : 0;
  const sgstAmount = isWestBengal ? totalTax / 2 : 0;
  const igstAmount = isWestBengal ? 0 : totalTax;

  const displayPlaceOfSupply = po.placeOfSupply || '19-West Bengal';
  const transportMode = po.transportMode || 'Road';
  const deliveryLocation = po.deliveryLocation || '';
  const euPoWoNumber = po.euPoWoNumber || '';

  return (
    <div id="po-pdf-content" className="bg-white text-black p-8 font-sans border shadow-sm max-w-[850px] mx-auto text-xs leading-relaxed">
      {/* 1. Header Section */}
      <div className="flex justify-between items-start border-b border-gray-100 pb-4">
        {/* Left Logo */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Grivety Global" className="h-14 object-contain" />
          </div>
          <span className="text-[8px] text-gray-500 font-semibold tracking-wider uppercase mt-1">We are ready to help you...</span>
        </div>
        
        {/* Right Company Address */}
        <div className="text-right max-w-[450px]">
          <h1 className="font-extrabold text-[15px] text-gray-900 tracking-wide">GRIVETY GLOBAL PRIVATE LIMITED</h1>
          <p className="text-[10px] text-gray-600 mt-1 font-semibold leading-normal">
            Disha Apartment, Flat No. 2, Ground Floor, DA-4/13,<br />
            Deshbandhu Nagar, Joramondir, Baguiati, VIP Road, Kolkata-700059
          </p>
          <p className="text-[10px] text-gray-600 mt-1 font-semibold">
            Phone no.: 033 40037666 &nbsp;|&nbsp; Email: info@grivetyglobal.com
          </p>
          <p className="text-[10px] text-gray-600 font-bold mt-0.5">
            GSTIN: 19AAHCG8472G1Z6 &nbsp;|&nbsp; State: 19-West Bengal
          </p>
          <p className="text-[10px] text-gray-600 font-bold">
            PAN: AAHCG8472G
          </p>
        </div>
      </div>

      {/* 2. Title Section */}
      <div className="w-full text-center bg-gray-100 border-t border-b border-gray-300 py-1 my-4">
        <h2 className="text-sm font-extrabold tracking-widest text-gray-700 uppercase">Purchase Order</h2>
      </div>

      {/* 3. Three-Column Order Info */}
      <div className="grid grid-cols-3 gap-6 border-b border-gray-300 pb-4 mb-4">
        {/* Column 1: Order To */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-[11px] text-gray-900 border-b pb-0.5 mb-1.5 uppercase">Order To</h3>
          <p className="font-extrabold text-[11px] text-black uppercase">{po.vendor?.name || po.vendor?.displayName || 'Unknown Vendor'}</p>
          <p className="text-[10px] text-gray-700 leading-normal">
            {po.vendor?.billingAddress?.street1 && <span>{po.vendor.billingAddress.street1}<br /></span>}
            {po.vendor?.billingAddress?.street2 && <span>{po.vendor.billingAddress.street2}<br /></span>}
            {po.vendor?.billingAddress?.city && <span>{po.vendor.billingAddress.city}, </span>}
            {po.vendor?.billingAddress?.state && <span>{po.vendor.billingAddress.state} </span>}
            {po.vendor?.billingAddress?.zip && <span>{po.vendor.billingAddress.zip}</span>}
          </p>
          {po.vendor?.phone && (
            <p className="text-[10px] text-gray-700 font-semibold">
              Contact No. : {po.vendor.phone}
            </p>
          )}
          {po.vendor?.gstNumber && (
            <p className="text-[10px] text-gray-700 font-semibold">
              GSTIN : {po.vendor.gstNumber}
            </p>
          )}
          {po.vendor?.billingAddress?.state && (
            <p className="text-[10px] text-gray-700 font-semibold">
              State: {po.vendor.billingAddress.state}
            </p>
          )}
        </div>

        {/* Column 2: Transportation Details */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-[11px] text-gray-900 border-b pb-0.5 mb-1.5 uppercase">Transportation Details</h3>
          <table className="w-full text-[10px] text-gray-700">
            <tbody>
              <tr>
                <td className="font-bold py-0.5 w-[50%]">Transport Mode:</td>
                <td className="py-0.5">{transportMode}</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5">Delivery Location:</td>
                <td className="py-0.5">{deliveryLocation || 'N/A'}</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5">EU PO/WO Number:</td>
                <td className="py-0.5">{euPoWoNumber || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Column 3: Order Details */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-[11px] text-gray-900 border-b pb-0.5 mb-1.5 uppercase">Order Details</h3>
          <table className="w-full text-[10px] text-gray-700">
            <tbody>
              <tr>
                <td className="font-bold py-0.5 w-[45%] text-right pr-2">Order No. :</td>
                <td className="font-bold text-gray-900 py-0.5">{po.purchaseOrderId}</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5 text-right pr-2">Date :</td>
                <td className="py-0.5">{formatDate(po.date)}</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5 text-right pr-2">Place of supply:</td>
                <td className="py-0.5">{displayPlaceOfSupply}</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5 text-right pr-2">Due Date :</td>
                <td className="py-0.5">{po.dueDate ? formatDate(po.dueDate) : formatDate(po.date)}</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5 text-right pr-2">Name:</td>
                <td className="py-0.5 font-semibold">Rina Mali</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5 text-right pr-2">Email:</td>
                <td className="py-0.5 text-gray-600">purchase@grivetyglobal.com</td>
              </tr>
              <tr>
                <td className="font-bold py-0.5 text-right pr-2">Mobile:</td>
                <td className="py-0.5">9147310390</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Line Items Table */}
      <table className="w-full text-[10px] border-collapse mb-4">
        <thead>
          <tr className="bg-gray-400 text-white font-bold uppercase text-[9px]">
            <th className="border border-gray-300 px-2 py-2 text-center w-[5%]">#</th>
            <th className="border border-gray-300 px-2 py-2 text-left w-[40%]">Item name</th>
            <th className="border border-gray-300 px-2 py-2 text-center w-[10%]">HSN/SAC</th>
            <th className="border border-gray-300 px-2 py-2 text-center w-[8%]">Quantity</th>
            <th className="border border-gray-300 px-2 py-2 text-center w-[8%]">Unit</th>
            <th className="border border-gray-300 px-2 py-2 text-right w-[10%]">Price/ Unit</th>
            <th className="border border-gray-300 px-2 py-2 text-right w-[10%]">Taxable amount</th>
            <th className="border border-gray-300 px-2 py-2 text-center w-[12%]">GST</th>
            <th className="border border-gray-300 px-2 py-2 text-right w-[12%]">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const price = Number(item.price) || Number(item.rate) || 0;
            const taxable = Number(item.taxableAmount) || (Number(item.quantity) * price);
            const rate = Number(item.gstRate) || 18;
            const tax = Number(item.gstAmount) || (taxable * (rate / 100));
            const total = Number(item.total) || (taxable + tax);
            
            return (
              <tr key={idx} className="hover:bg-gray-50 text-gray-800">
                <td className="border border-gray-300 px-2 py-2.5 text-center font-medium">{idx + 1}</td>
                <td className="border border-gray-300 px-2 py-2.5">
                  <div className="font-extrabold text-black leading-tight">{item.name}</div>
                  <div className="text-[8px] text-gray-500 mt-0.5">(Make: Commscope)</div>
                </td>
                <td className="border border-gray-300 px-2 py-2.5 text-center font-semibold font-mono">{item.hsnSac || 'N/A'}</td>
                <td className="border border-gray-300 px-2 py-2.5 text-center font-extrabold font-mono">{item.quantity}</td>
                <td className="border border-gray-300 px-2 py-2.5 text-center font-semibold">{item.unit || 'Nos'}</td>
                <td className="border border-gray-300 px-2 py-2.5 text-right font-bold font-mono">{formatCurrency(price, currency)}</td>
                <td className="border border-gray-300 px-2 py-2.5 text-right font-bold font-mono">{formatCurrency(taxable, currency)}</td>
                <td className="border border-gray-300 px-2 py-2.5 text-center leading-normal font-semibold font-mono">
                  <div>{formatCurrency(tax, currency)}</div>
                  <div className="text-[8px] text-gray-500">({rate}%)</div>
                </td>
                <td className="border border-gray-300 px-2 py-2.5 text-right font-extrabold font-mono text-gray-900">{formatCurrency(total, currency)}</td>
              </tr>
            );
          })}
          
          {/* Table Totals Row */}
          <tr className="bg-gray-100 font-extrabold text-black uppercase">
            <td colSpan={3} className="border border-gray-300 px-2 py-2 text-right">Total</td>
            <td className="border border-gray-300 px-2 py-2 text-center font-mono">{totalQty}</td>
            <td className="border border-gray-300 px-2 py-2"></td>
            <td className="border border-gray-300 px-2 py-2"></td>
            <td className="border border-gray-300 px-2 py-2 text-right font-mono">{formatCurrency(totalTaxable, currency)}</td>
            <td className="border border-gray-300 px-2 py-2 text-center font-mono">{formatCurrency(totalTax, currency)}</td>
            <td className="border border-gray-300 px-2 py-2 text-right font-mono">{formatCurrency(totalAmount, currency)}</td>
          </tr>
        </tbody>
      </table>

      {/* 5. Details Breakdowns & Signatures */}
      <div className="grid grid-cols-2 gap-6 mt-4 pt-2">
        {/* Left Side: Tax Type, Words, Terms */}
        <div className="space-y-4">
          {/* Tax Breakdown Table */}
          <div>
            <table className="w-full text-[9px] border border-gray-300 border-collapse">
              <thead>
                <tr className="bg-gray-400 text-white font-bold uppercase">
                  <th className="border border-gray-300 px-2 py-1.5 text-left">Tax type</th>
                  <th className="border border-gray-300 px-2 py-1.5 text-right">Taxable amount</th>
                  <th className="border border-gray-300 px-2 py-1.5 text-center">Rate</th>
                  <th className="border border-gray-300 px-2 py-1.5 text-right">Tax amount</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-gray-800">
                {isWestBengal ? (
                  <>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1.5">SGST</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-mono">{formatCurrency(totalTaxable, currency)}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center font-mono">9%</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-mono">{formatCurrency(sgstAmount, currency)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1.5">CGST</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-mono">{formatCurrency(totalTaxable, currency)}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center font-mono">9%</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-mono">{formatCurrency(cgstAmount, currency)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5">IGST</td>
                    <td className="border border-gray-300 px-2 py-1.5 text-right font-mono">{formatCurrency(totalTaxable, currency)}</td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center font-mono">18%</td>
                    <td className="border border-gray-300 px-2 py-1.5 text-right font-mono">{formatCurrency(igstAmount, currency)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Amount In Words */}
          <div className="border border-gray-300 rounded p-2 bg-gray-50">
            <span className="text-[9px] uppercase font-bold text-gray-500 block mb-0.5">Order Amount In Words</span>
            <p className="text-[10px] font-extrabold text-gray-900 leading-snug">{numberToWords(finalTotal)}</p>
          </div>

          {/* Terms & Conditions */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="bg-gray-400 text-white font-bold uppercase px-2.5 py-1 text-[9px]">
              Terms and Conditions
            </div>
            <div className="p-2.5 text-[9px] text-gray-700 whitespace-pre-line leading-relaxed font-semibold">
              {po.termsAndConditions || 'GST: 18% as mentioned above.\nPayment Terms: 45 Days credit.\nDelivery Time: Urgent.'}
            </div>
          </div>
        </div>

        {/* Right Side: Financials Summary & Sign Block */}
        <div className="flex flex-col justify-between items-end pl-6">
          {/* Financials Summary */}
          <div className="w-full border border-gray-300 rounded overflow-hidden">
            <div className="bg-gray-400 text-white font-bold uppercase px-2.5 py-1 text-[9px]">
              Amounts
            </div>
            <table className="w-full text-[10px] text-gray-700 font-semibold">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-1.5 text-left">Sub Total</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(totalTaxable, currency)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-1.5 text-left">Round off</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(roundOff, currency)}</td>
                </tr>
                <tr className="bg-gray-50 font-extrabold text-black border-b border-gray-200">
                  <td className="px-3 py-2 text-left">Total</td>
                  <td className="px-3 py-2 text-right font-mono">{formatCurrency(finalTotal, currency)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-1.5 text-left">Advance</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(advance, currency)}</td>
                </tr>
                <tr className="bg-gray-100 font-extrabold text-black">
                  <td className="px-3 py-2 text-left">Balance</td>
                  <td className="px-3 py-2 text-right font-mono">{formatCurrency(balance, currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sign block */}
          <div className="w-full text-center mt-6 flex flex-col items-center border-t border-gray-100 pt-4">
            <span className="text-[10px] font-bold text-gray-800 block">For : GRIVETY GLOBAL PRIVATE LIMITED</span>
            
            {/* Signature stamp container */}
            <div className="my-2.5 h-16 flex items-center justify-center relative select-none">
              <img 
                src="/signature_stamp.png" 
                alt="Authorized Signatory" 
                className="h-16 w-auto object-contain mix-blend-multiply opacity-90"
              />
            </div>
            
            <span className="text-[10px] font-extrabold text-gray-900 border-t border-dashed border-gray-300 pt-1 px-4 tracking-wider uppercase">
              Authorized Signatory
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
