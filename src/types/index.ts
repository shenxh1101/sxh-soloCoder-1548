export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  contact: string;
  category: string;
  lastPrice?: number;
  lastPurchaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  supplierId: string;
  shelfLifeDays: number;
  stockThreshold: number;
  sellingPrice: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryBatch {
  id: string;
  productId: string;
  quantity: number;
  remainingQuantity: number;
  productionDate: string;
  expiryDate: string;
  purchasePrice: number;
  supplierId: string;
  purchaseDate: string;
  createdAt: string;
}

export interface SaleRecord {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  saleDate: string;
  promotionId?: string;
}

export interface WasteRecord {
  id: string;
  productId: string;
  quantity: number;
  lossAmount: number;
  reason: string;
  wasteDate: string;
}

export type PromotionType = 'buy_one_get_one' | 'discount' | 'bundle';

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  buyQuantity: number;
  freeQuantity: number;
  discountPercent?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds: string[];
}

export type ExpiryStatus = 'normal' | 'warning' | 'expired';

export interface BatchWithProduct extends InventoryBatch {
  productName: string;
  categoryName: string;
  categoryColor: string;
  daysUntilExpiry: number;
  expiryStatus: ExpiryStatus;
}

export interface ProductWithDetails extends Product {
  categoryName: string;
  categoryColor: string;
  supplierName: string;
  supplierPhone: string;
  needsRestock: boolean;
  nearestExpiryDate?: string;
  daysUntilNearestExpiry?: number;
}

export interface RestockItem {
  productId: string;
  productName: string;
  currentStock: number;
  stockThreshold: number;
  suggestedQuantity: number;
  sellingPrice: number;
}

export interface RestockGroup {
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  items: RestockItem[];
}

export interface TopSellingItem {
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  revenue: number;
}

export interface WasteStatItem {
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  lossAmount: number;
}

export interface DailySalesTrend {
  date: string;
  revenue: number;
  quantity: number;
}

export interface PromotionAnalysis {
  productId: string;
  productName: string;
  promotionSales: number;
  normalSales: number;
  increasePercent: number;
  promotionRevenue: number;
}
