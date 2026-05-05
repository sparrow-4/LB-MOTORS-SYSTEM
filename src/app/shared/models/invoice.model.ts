export interface Invoice {
  id: string;
  invoiceNumber: string;
  vehicleId: string;
  vehicleName: string;
  vehicleNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  basePrice: number;
  gstPercent: number;
  gstType: GstType;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  notes: string;
  createdAt: string;
}

export type GstType = 'intra-state' | 'inter-state';
