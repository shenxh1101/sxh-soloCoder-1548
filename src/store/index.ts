import { create } from 'zustand';
import {
  Category,
  Supplier,
  Product,
  InventoryBatch,
  SaleRecord,
  WasteRecord,
  Promotion,
  ProductWithDetails,
  BatchWithProduct,
  RestockGroup,
  TopSellingItem,
  WasteStatItem,
  DailySalesTrend,
  PromotionAnalysis,
} from '@/types';
import { saveToStorage, loadFromStorage } from '@/utils/storage';
import {
  generateId,
  getTodayString,
  getNowString,
  getCurrentMonthRange,
  getDaysBetween,
} from '@/utils/dateUtils';
import {
  calculateExpiryDate,
  getExpiryStatus,
  getDaysUntilExpiry,
  getExpiringBatches,
  getProductNearestExpiry,
} from '@/utils/expiryUtils';
import {
  generateMockCategories,
  generateMockSuppliers,
  generateMockProducts,
  generateMockBatches,
  generateMockSales,
  generateMockWaste,
  generateMockPromotions,
} from '@/utils/mockData';

interface StoreState {
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  batches: InventoryBatch[];
  sales: SaleRecord[];
  waste: WasteRecord[];
  promotions: Promotion[];
  isInitialized: boolean;

  initData: () => void;

  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  addProduct: (product: Omit<Product, 'id' | 'currentStock' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addBatch: (batch: Omit<InventoryBatch, 'id' | 'remainingQuantity' | 'expiryDate' | 'createdAt'>) => void;
  updateBatch: (id: string, batch: Partial<InventoryBatch>) => void;
  deleteBatch: (id: string) => void;

  addSale: (sale: Omit<SaleRecord, 'id' | 'totalAmount'>) => void;
  addWaste: (waste: Omit<WasteRecord, 'id'>) => void;
  markBatchAsWaste: (batchId: string, quantity: number, reason: string) => void;

  addPromotion: (promotion: Omit<Promotion, 'id'>) => void;
  updatePromotion: (id: string, promotion: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;

  getProductWithDetails: () => ProductWithDetails[];
  getExpiringBatches: (days?: number) => BatchWithProduct[];
  getExpiredBatches: () => BatchWithProduct[];
  getRestockList: () => RestockGroup[];
  getTopSellingProducts: (limit?: number) => TopSellingItem[];
  getWasteStatistics: () => WasteStatItem[];
  getDailySalesTrend: (days?: number) => DailySalesTrend[];
  getPromotionAnalysis: (promotionId: string) => PromotionAnalysis[];
}

export const useStore = create<StoreState>((set, get) => ({
  categories: [],
  suppliers: [],
  products: [],
  batches: [],
  sales: [],
  waste: [],
  promotions: [],
  isInitialized: false,

  initData: () => {
    if (get().isInitialized) return;

    const hasData = loadFromStorage('hasData', false);

    if (hasData) {
      set({
        categories: loadFromStorage('categories', []),
        suppliers: loadFromStorage('suppliers', []),
        products: loadFromStorage('products', []),
        batches: loadFromStorage('batches', []),
        sales: loadFromStorage('sales', []),
        waste: loadFromStorage('waste', []),
        promotions: loadFromStorage('promotions', []),
        isInitialized: true,
      });
    } else {
      const categories = generateMockCategories();
      const suppliers = generateMockSuppliers();
      const products = generateMockProducts();
      const batches = generateMockBatches();
      const sales = generateMockSales();
      const waste = generateMockWaste();
      const promotions = generateMockPromotions();

      set({
        categories,
        suppliers,
        products,
        batches,
        sales,
        waste,
        promotions,
        isInitialized: true,
      });

      saveToStorage('categories', categories);
      saveToStorage('suppliers', suppliers);
      saveToStorage('products', products);
      saveToStorage('batches', batches);
      saveToStorage('sales', sales);
      saveToStorage('waste', waste);
      saveToStorage('promotions', promotions);
      saveToStorage('hasData', true);
    }
  },

  addCategory: (name, color) => {
    const category: Category = { id: generateId(), name, color };
    const categories = [...get().categories, category];
    set({ categories });
    saveToStorage('categories', categories);
  },

  updateCategory: (id, name, color) => {
    const categories = get().categories.map((c) =>
      c.id === id ? { ...c, name, color } : c
    );
    set({ categories });
    saveToStorage('categories', categories);
  },

  deleteCategory: (id) => {
    const categories = get().categories.filter((c) => c.id !== id);
    set({ categories });
    saveToStorage('categories', categories);
  },

  addSupplier: (supplier) => {
    const now = getNowString();
    const newSupplier: Supplier = {
      ...supplier,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const suppliers = [...get().suppliers, newSupplier];
    set({ suppliers });
    saveToStorage('suppliers', suppliers);
  },

  updateSupplier: (id, supplier) => {
    const now = getNowString();
    const suppliers = get().suppliers.map((s) =>
      s.id === id ? { ...s, ...supplier, updatedAt: now } : s
    );
    set({ suppliers });
    saveToStorage('suppliers', suppliers);
  },

  deleteSupplier: (id) => {
    const suppliers = get().suppliers.filter((s) => s.id !== id);
    set({ suppliers });
    saveToStorage('suppliers', suppliers);
  },

  addProduct: (product) => {
    const now = getNowString();
    const newProduct: Product = {
      ...product,
      id: generateId(),
      currentStock: 0,
      createdAt: now,
      updatedAt: now,
    };
    const products = [...get().products, newProduct];
    set({ products });
    saveToStorage('products', products);
  },

  updateProduct: (id, product) => {
    const now = getNowString();
    const products = get().products.map((p) =>
      p.id === id ? { ...p, ...product, updatedAt: now } : p
    );
    set({ products });
    saveToStorage('products', products);
  },

  deleteProduct: (id) => {
    const products = get().products.filter((p) => p.id !== id);
    set({ products });
    saveToStorage('products', products);
  },

  addBatch: (batch) => {
    const product = get().products.find((p) => p.id === batch.productId);
    if (!product) return;

    const expiryDate = calculateExpiryDate(
      batch.productionDate,
      product.shelfLifeDays
    );

    const newBatch: InventoryBatch = {
      ...batch,
      id: generateId(),
      remainingQuantity: batch.quantity,
      expiryDate,
      createdAt: getNowString(),
    };

    const batches = [...get().batches, newBatch];
    const products = get().products.map((p) =>
      p.id === batch.productId
        ? { ...p, currentStock: p.currentStock + batch.quantity }
        : p
    );

    const suppliers = get().suppliers.map((s) =>
      s.id === batch.supplierId
        ? {
            ...s,
            lastPrice: batch.purchasePrice,
            lastPurchaseDate: batch.purchaseDate,
          }
        : s
    );

    set({ batches, products, suppliers });
    saveToStorage('batches', batches);
    saveToStorage('products', products);
    saveToStorage('suppliers', suppliers);
  },

  updateBatch: (id, batch) => {
    const batches = get().batches.map((b) =>
      b.id === id ? { ...b, ...batch } : b
    );
    set({ batches });
    saveToStorage('batches', batches);
  },

  deleteBatch: (id) => {
    const batch = get().batches.find((b) => b.id === id);
    if (!batch) return;

    const batches = get().batches.filter((b) => b.id !== id);
    const products = get().products.map((p) =>
      p.id === batch.productId
        ? { ...p, currentStock: p.currentStock - batch.remainingQuantity }
        : p
    );

    set({ batches, products });
    saveToStorage('batches', batches);
    saveToStorage('products', products);
  },

  addSale: (sale) => {
    const { products, batches } = get();
    const product = products.find((p) => p.id === sale.productId);
    if (!product) return;

    let remainingQty = sale.quantity;
    const productBatches = batches
      .filter((b) => b.productId === sale.productId && b.remainingQuantity > 0)
      .sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );

    const updatedBatches = [...batches];
    for (const batch of productBatches) {
      if (remainingQty <= 0) break;
      const takeQty = Math.min(remainingQty, batch.remainingQuantity);
      const batchIndex = updatedBatches.findIndex((b) => b.id === batch.id);
      if (batchIndex !== -1) {
        updatedBatches[batchIndex] = {
          ...updatedBatches[batchIndex],
          remainingQuantity: batch.remainingQuantity - takeQty,
        };
      }
      remainingQty -= takeQty;
    }

    const newSale: SaleRecord = {
      ...sale,
      id: generateId(),
      totalAmount: sale.quantity * sale.unitPrice,
    };

    const updatedProducts = products.map((p) =>
      p.id === sale.productId
        ? { ...p, currentStock: p.currentStock - sale.quantity }
        : p
    );

    const sales = [...get().sales, newSale];
    set({ sales, batches: updatedBatches, products: updatedProducts });
    saveToStorage('sales', sales);
    saveToStorage('batches', updatedBatches);
    saveToStorage('products', updatedProducts);
  },

  addWaste: (waste) => {
    const newWaste: WasteRecord = {
      ...waste,
      id: generateId(),
    };
    const wasteRecords = [...get().waste, newWaste];
    set({ waste: wasteRecords });
    saveToStorage('waste', wasteRecords);
  },

  markBatchAsWaste: (batchId, quantity, reason) => {
    const { batches, products, waste } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    const updatedBatches = batches.map((b) =>
      b.id === batchId
        ? { ...b, remainingQuantity: b.remainingQuantity - quantity }
        : b
    );

    const updatedProducts = products.map((p) =>
      p.id === batch.productId
        ? { ...p, currentStock: p.currentStock - quantity }
        : p
    );

    const newWaste: WasteRecord = {
      id: generateId(),
      productId: batch.productId,
      quantity,
      lossAmount: quantity * batch.purchasePrice,
      reason,
      wasteDate: getTodayString(),
    };

    const wasteRecords = [...waste, newWaste];
    set({ waste: wasteRecords, batches: updatedBatches, products: updatedProducts });
    saveToStorage('waste', wasteRecords);
    saveToStorage('batches', updatedBatches);
    saveToStorage('products', updatedProducts);
  },

  addPromotion: (promotion) => {
    const newPromotion: Promotion = {
      ...promotion,
      id: generateId(),
    };
    const promotions = [...get().promotions, newPromotion];
    set({ promotions });
    saveToStorage('promotions', promotions);
  },

  updatePromotion: (id, promotion) => {
    const promotions = get().promotions.map((p) =>
      p.id === id ? { ...p, ...promotion } : p
    );
    set({ promotions });
    saveToStorage('promotions', promotions);
  },

  deletePromotion: (id) => {
    const promotions = get().promotions.filter((p) => p.id !== id);
    set({ promotions });
    saveToStorage('promotions', promotions);
  },

  getProductWithDetails: () => {
    const { products, categories, suppliers, batches } = get();
    return products.map((product) => {
      const category = categories.find((c) => c.id === product.categoryId)!;
      const supplier = suppliers.find((s) => s.id === product.supplierId)!;
      const nearestExpiry = getProductNearestExpiry(product.id, batches);

      return {
        ...product,
        categoryName: category.name,
        categoryColor: category.color,
        supplierName: supplier.name,
        supplierPhone: supplier.phone,
        needsRestock: product.currentStock <= product.stockThreshold,
        nearestExpiryDate: nearestExpiry?.date,
        daysUntilNearestExpiry: nearestExpiry?.days,
      };
    });
  },

  getExpiringBatches: (days = 3) => {
    const { batches, products, categories } = get();
    return getExpiringBatches(batches, products, categories, days);
  },

  getExpiredBatches: () => {
    const { batches, products, categories } = get();
    return batches
      .filter((b) => b.remainingQuantity > 0 && getDaysUntilExpiry(b.expiryDate) < 0)
      .map((batch) => {
        const product = products.find((p) => p.id === batch.productId)!;
        const category = categories.find((c) => c.id === product.categoryId)!;
        return {
          ...batch,
          productName: product.name,
          categoryName: category.name,
          categoryColor: category.color,
          daysUntilExpiry: getDaysUntilExpiry(batch.expiryDate),
          expiryStatus: 'expired' as const,
        };
      });
  },

  getRestockList: () => {
    const { products, suppliers } = get();
    const restockProducts = products.filter(
      (p) => p.currentStock <= p.stockThreshold
    );

    const groups = new Map<string, RestockGroup>();

    restockProducts.forEach((product) => {
      const supplier = suppliers.find((s) => s.id === product.supplierId);
      if (!supplier) return;

      if (!groups.has(supplier.id)) {
        groups.set(supplier.id, {
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierPhone: supplier.phone,
          items: [],
        });
      }

      const group = groups.get(supplier.id)!;
      group.items.push({
        productId: product.id,
        productName: product.name,
        currentStock: product.currentStock,
        stockThreshold: product.stockThreshold,
        suggestedQuantity: Math.max(
          product.stockThreshold * 2 - product.currentStock,
          product.stockThreshold
        ),
        sellingPrice: product.sellingPrice,
      });
    });

    return Array.from(groups.values());
  },

  getTopSellingProducts: (limit = 10) => {
    const { sales, products, categories } = get();
    const { start } = getCurrentMonthRange();

    const monthSales = sales.filter((s) => s.saleDate >= start);

    const productSales = new Map<string, { quantity: number; revenue: number }>();

    monthSales.forEach((sale) => {
      const current = productSales.get(sale.productId) || { quantity: 0, revenue: 0 };
      productSales.set(sale.productId, {
        quantity: current.quantity + sale.quantity,
        revenue: current.revenue + sale.totalAmount,
      });
    });

    return Array.from(productSales.entries())
      .map(([productId, data]) => {
        const product = products.find((p) => p.id === productId)!;
        const category = categories.find((c) => c.id === product.categoryId)!;
        return {
          productId,
          productName: product.name,
          categoryName: category.name,
          quantity: data.quantity,
          revenue: data.revenue,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  },

  getWasteStatistics: () => {
    const { waste, products, categories } = get();
    const { start } = getCurrentMonthRange();

    const monthWaste = waste.filter((w) => w.wasteDate >= start);

    const productWaste = new Map<string, { quantity: number; lossAmount: number }>();

    monthWaste.forEach((w) => {
      const current = productWaste.get(w.productId) || { quantity: 0, lossAmount: 0 };
      productWaste.set(w.productId, {
        quantity: current.quantity + w.quantity,
        lossAmount: current.lossAmount + w.lossAmount,
      });
    });

    return Array.from(productWaste.entries())
      .map(([productId, data]) => {
        const product = products.find((p) => p.id === productId)!;
        const category = categories.find((c) => c.id === product.categoryId)!;
        return {
          productId,
          productName: product.name,
          categoryName: category.name,
          quantity: data.quantity,
          lossAmount: data.lossAmount,
        };
      })
      .sort((a, b) => b.lossAmount - a.lossAmount);
  },

  getDailySalesTrend: (days = 30) => {
    const { sales } = get();
    const today = getTodayString();
    const trend: DailySalesTrend[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const daySales = sales.filter((s) => s.saleDate === dateStr);
      const revenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
      const quantity = daySales.reduce((sum, s) => sum + s.quantity, 0);

      trend.push({
        date: dateStr,
        revenue,
        quantity,
      });
    }

    return trend;
  },

  getPromotionAnalysis: (promotionId) => {
    const { sales, products, promotions } = get();
    const promotion = promotions.find((p) => p.id === promotionId);
    if (!promotion) return [];

    const promotionDays = getDaysBetween(promotion.startDate, promotion.endDate) + 1;

    return promotion.productIds.map((productId) => {
      const product = products.find((p) => p.id === productId)!;

      const promotionSales = sales.filter(
        (s) =>
          s.productId === productId &&
          s.saleDate >= promotion.startDate &&
          s.saleDate <= promotion.endDate
      );

      const promotionQty = promotionSales.reduce((sum, s) => sum + s.quantity, 0);
      const promotionRevenue = promotionSales.reduce((sum, s) => sum + s.totalAmount, 0);

      const beforeStart = new Date(promotion.startDate);
      beforeStart.setDate(beforeStart.getDate() - promotionDays);
      const beforeStartStr = beforeStart.toISOString().split('T')[0];
      const beforeEndStr = promotion.startDate;

      const beforeSales = sales.filter(
        (s) =>
          s.productId === productId &&
          s.saleDate >= beforeStartStr &&
          s.saleDate < beforeEndStr
      );

      const normalQty = beforeSales.reduce((sum, s) => sum + s.quantity, 0);
      const avgNormalQty = normalQty / promotionDays;
      const expectedNormalQty = avgNormalQty * promotionDays;

      const increasePercent =
        expectedNormalQty > 0
          ? ((promotionQty - expectedNormalQty) / expectedNormalQty) * 100
          : promotionQty > 0
          ? 100
          : 0;

      return {
        productId,
        productName: product.name,
        promotionSales: promotionQty,
        normalSales: Math.round(expectedNormalQty),
        increasePercent: Math.round(increasePercent),
        promotionRevenue,
      };
    });
  },
}));
