export interface Buyer {
  id: string;
  name: string;
  phone: string;
  address: string;
  aadhaarNumber: string;
  document?: UploadedDocument;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedDocument {
  fileName: string;
  fileType: string;
  fileSize: number;
  base64Content: string;
  uploadedAt: string;
}
