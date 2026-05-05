export interface Vehicle {
  id: string;
  vehicleNumber: string;
  model: string;
  type: VehicleType;
  purchasePrice: number;
  salesPrice: number;
  description: string;
  status: VehicleStatus;
  sellerId?: string; // Links to the Seller who supplied it
  buyerId?: string;  // Links to the Buyer who bought it
  document?: {
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type VehicleType = 'Car' | 'Bike';
export type VehicleStatus = 'Available' | 'Sold';
