export interface Vehicle {
  id: string;
  vehicleNumber: string;
  model: string;
  type: VehicleType;
  price: number;
  description: string;
  status: VehicleStatus;
  sellerId?: string; // Links to the Seller who supplied it
  buyerId?: string;  // Links to the Buyer who bought it
  createdAt: string;
  updatedAt: string;
}

export type VehicleType = 'Car' | 'Bike';
export type VehicleStatus = 'Available' | 'Sold';
