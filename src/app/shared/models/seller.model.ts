import { UploadedDocument } from './buyer.model';

export interface Seller {
  id: string;
  name: string;
  phone: string;
  address: string;
  aadhaarNumber: string;
  document?: UploadedDocument;
  totalVehiclesSupplied: number;
  createdAt: string;
  updatedAt: string;
}
