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
  reason: string;
}

export interface WasteByReason {
  reason: string;
  quantity: number;
  lossAmount: number;
  products: WasteStatItem[];
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

export type InventoryLogType = 'inbound' | 'sale' | 'waste' | 'adjust' | 'delete';

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: InventoryLogType;
  typeName: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  unitPrice?: number;
  totalAmount?: number;
  reason?: string;
  batchId?: string;
  supplierId?: string;
  promotionId?: string;
  operator?: string;
  createdAt: string;
}

export interface ProfitMonthly {
  month: string;
  revenue: number;
  cost: number;
  wasteLoss: number;
  grossProfit: number;
  grossMargin: number;
}

export interface ProfitProduct {
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  revenue: number;
  cost: number;
  wasteLoss: number;
  grossProfit: number;
  grossMargin: number;
}

export interface SmartRestockItem extends RestockItem {
  avgDailySales: number;
  estimatedDaysLeft: number;
  suggestedPurchaseAmount: number;
  lastPurchasePrice: number;
}

export interface SmartRestockGroup extends RestockGroup {
  items: SmartRestockItem[];
  totalSuggestedAmount: number;
}

export interface InventoryLogFilter {
  productId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}
