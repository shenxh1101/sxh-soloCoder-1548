import {
  InventoryBatch,
  Product,
  BatchWithProduct,
  ExpiryStatus,
  Category,
} from '@/types';
import { getDaysUntil, isDatePast, formatDate, addDaysToDate } from './dateUtils';

export function calculateExpiryDate(
  productionDate: string,
  shelfLifeDays: number
): string {
  return addDaysToDate(productionDate, shelfLifeDays - 1);
}

export function getDaysUntilExpiry(expiryDate: string): number {
  return getDaysUntil(expiryDate);
}

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const days = getDaysUntilExpiry(expiryDate);
  
  if (isDatePast(expiryDate)) {
    return 'expired';
  } else if (days <= 3) {
    return 'warning';
  }
  return 'normal';
}

export function getExpiryStatusColor(status: ExpiryStatus): string {
  switch (status) {
    case 'expired':
      return 'text-destructive bg-destructive/10';
    case 'warning':
      return 'text-warning bg-warning/10';
    default:
      return 'text-success bg-success/10';
  }
}

export function getExpiryStatusText(status: ExpiryStatus, days: number): string {
  if (status === 'expired') {
    return `已过期 ${Math.abs(days)} 天`;
  } else if (days === 0) {
    return '今天过期';
  } else if (days === 1) {
    return '明天过期';
  } else if (days <= 3) {
    return `还剩 ${days} 天`;
  }
  return `还剩 ${days} 天`;
}

export function enrichBatchWithProduct(
  batch: InventoryBatch,
  product: Product,
  category: Category
): BatchWithProduct {
  const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
  const expiryStatus = getExpiryStatus(batch.expiryDate);

  return {
    ...batch,
    productName: product.name,
    categoryName: category.name,
    categoryColor: category.color,
    daysUntilExpiry,
    expiryStatus,
  };
}

export function getExpiringBatches(
  batches: InventoryBatch[],
  products: Product[],
  categories: Category[],
  days: number = 3
): BatchWithProduct[] {
  return batches
    .filter((batch) => {
      if (batch.remainingQuantity <= 0) return false;
      const daysUntil = getDaysUntilExpiry(batch.expiryDate);
      return daysUntil <= days && !isDatePast(batch.expiryDate);
    })
    .map((batch) => {
      const product = products.find((p) => p.id === batch.productId)!;
      const category = categories.find((c) => c.id === product.categoryId)!;
      return enrichBatchWithProduct(batch, product, category);
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

export function getExpiredBatches(
  batches: InventoryBatch[],
  products: Product[],
  categories: Category[]
): BatchWithProduct[] {
  return batches
    .filter((batch) => {
      if (batch.remainingQuantity <= 0) return false;
      return isDatePast(batch.expiryDate);
    })
    .map((batch) => {
      const product = products.find((p) => p.id === batch.productId)!;
      const category = categories.find((c) => c.id === product.categoryId)!;
      return enrichBatchWithProduct(batch, product, category);
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

export function getProductNearestExpiry(
  productId: string,
  batches: InventoryBatch[]
): { date: string; days: number } | null {
  const productBatches = batches
    .filter((b) => b.productId === productId && b.remainingQuantity > 0)
    .sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );

  if (productBatches.length === 0) return null;

  const nearest = productBatches[0];
  return {
    date: nearest.expiryDate,
    days: getDaysUntilExpiry(nearest.expiryDate),
  };
}
