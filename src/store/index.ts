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
  WasteByReason,
  DailySalesTrend,
  PromotionAnalysis,
  InventoryLog,
  InventoryLogFilter,
  ProfitMonthly,
  ProfitProduct,
  SmartRestockGroup,
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
  inventoryLogs: InventoryLog[];
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

  addInventoryLog: (log: Omit<InventoryLog, 'id' | 'createdAt'>) => void;

  getProductWithDetails: () => ProductWithDetails[];
  getExpiringBatches: (days?: number) => BatchWithProduct[];
  getExpiredBatches: () => BatchWithProduct[];
  getRestockList: () => RestockGroup[];
  getSmartRestockList: () => SmartRestockGroup[];
  getTopSellingProducts: (limit?: number, month?: string) => TopSellingItem[];
  getWasteStatistics: (month?: string, reason?: string) => WasteStatItem[];
  getWasteByReason: (month?: string) => WasteByReason[];
  getDailySalesTrend: (days?: number, month?: string) => DailySalesTrend[];
  getPromotionAnalysis: (promotionId: string) => PromotionAnalysis[];
  getInventoryLogs: (filter?: InventoryLogFilter) => InventoryLog[];
  getMonthlyProfit: (months?: number) => ProfitMonthly[];
  getProductProfit: (month?: string) => ProfitProduct[];
}

export const useStore = create<StoreState>((set, get) => ({
  categories: [],
  suppliers: [],
  products: [],
  batches: [],
  sales: [],
  waste: [],
  promotions: [],
  inventoryLogs: [],
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
        inventoryLogs: loadFromStorage('inventoryLogs', []),
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
      const inventoryLogs: InventoryLog[] = [];

      set({
        categories,
        suppliers,
        products,
        batches,
        sales,
        waste,
        promotions,
        inventoryLogs,
        isInitialized: true,
      });

      saveToStorage('categories', categories);
      saveToStorage('suppliers', suppliers);
      saveToStorage('products', products);
      saveToStorage('batches', batches);
      saveToStorage('sales', sales);
      saveToStorage('waste', waste);
      saveToStorage('promotions', promotions);
      saveToStorage('inventoryLogs', inventoryLogs);
      saveToStorage('hasData', true);
    }
  },

  addInventoryLog: (log) => {
    const newLog: InventoryLog = {
      ...log,
      id: generateId(),
      createdAt: getNowString(),
    };
    const inventoryLogs = [...get().inventoryLogs, newLog];
    set({ inventoryLogs });
    saveToStorage('inventoryLogs', inventoryLogs);
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
    const { products, batches, sales, waste, promotions, addInventoryLog } = get();
    const product = products.find((p) => p.id === id);
    const productBatches = batches.filter((b) => b.productId === id && b.remainingQuantity > 0);
    const totalRemaining = productBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);

    const filteredProducts = products.filter((p) => p.id !== id);
    const filteredBatches = batches.filter((b) => b.productId !== id);
    const filteredSales = sales.filter((s) => s.productId !== id);
    const filteredWaste = waste.filter((w) => w.productId !== id);
    const filteredPromotions = promotions.map((p) => ({
      ...p,
      productIds: p.productIds.filter((pid) => pid !== id),
    }));

    if (product) {
      addInventoryLog({
        productId: product.id,
        productName: product.name,
        type: 'delete',
        typeName: '删除商品',
        quantityChange: -product.currentStock,
        stockBefore: product.currentStock,
        stockAfter: 0,
        reason: '商品被删除',
      });
    }

    set({
      products: filteredProducts,
      batches: filteredBatches,
      sales: filteredSales,
      waste: filteredWaste,
      promotions: filteredPromotions,
    });

    saveToStorage('products', filteredProducts);
    saveToStorage('batches', filteredBatches);
    saveToStorage('sales', filteredSales);
    saveToStorage('waste', filteredWaste);
    saveToStorage('promotions', filteredPromotions);
  },

  addBatch: (batch) => {
    const { products, suppliers, addInventoryLog } = get();
    const product = products.find((p) => p.id === batch.productId);
    if (!product) return;

    const expiryDate = calculateExpiryDate(
      batch.productionDate,
      product.shelfLifeDays
    );

    const stockBefore = product.currentStock;
    const stockAfter = stockBefore + batch.quantity;

    const newBatch: InventoryBatch = {
      ...batch,
      id: generateId(),
      remainingQuantity: batch.quantity,
      expiryDate,
      createdAt: getNowString(),
    };

    const batches = [...get().batches, newBatch];
    const updatedProducts = products.map((p) =>
      p.id === batch.productId
        ? { ...p, currentStock: stockAfter }
        : p
    );

    const updatedSuppliers = suppliers.map((s) =>
      s.id === batch.supplierId
        ? {
            ...s,
            lastPrice: batch.purchasePrice,
            lastPurchaseDate: batch.purchaseDate,
          }
        : s
    );

    addInventoryLog({
      productId: product.id,
      productName: product.name,
      type: 'inbound',
      typeName: '入库',
      quantityChange: batch.quantity,
      stockBefore,
      stockAfter,
      unitPrice: batch.purchasePrice,
      totalAmount: batch.quantity * batch.purchasePrice,
      batchId: newBatch.id,
      supplierId: batch.supplierId,
    });

    set({ batches, products: updatedProducts, suppliers: updatedSuppliers });
    saveToStorage('batches', batches);
    saveToStorage('products', updatedProducts);
    saveToStorage('suppliers', updatedSuppliers);
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
    const { products, batches, addInventoryLog } = get();
    const product = products.find((p) => p.id === sale.productId);
    if (!product) return;

    const availableStock = batches
      .filter((b) => b.productId === sale.productId && b.remainingQuantity > 0)
      .reduce((sum, b) => sum + b.remainingQuantity, 0);

    if (sale.quantity > availableStock) {
      throw new Error(`库存不足！当前可用库存仅 ${availableStock} 件`);
    }

    const stockBefore = product.currentStock;
    const stockAfter = stockBefore - sale.quantity;

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
        ? { ...p, currentStock: stockAfter }
        : p
    );

    addInventoryLog({
      productId: product.id,
      productName: product.name,
      type: 'sale',
      typeName: '销售出库',
      quantityChange: -sale.quantity,
      stockBefore,
      stockAfter,
      unitPrice: sale.unitPrice,
      totalAmount: newSale.totalAmount,
      promotionId: sale.promotionId,
    });

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
    const { batches, products, waste, addInventoryLog } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    const product = products.find((p) => p.id === batch.productId);
    if (!product) return;

    const normalizedReason = reason === '已过期' ? '过期未售出' : reason;
    const stockBefore = product.currentStock;
    const stockAfter = stockBefore - quantity;

    const updatedBatches = batches.map((b) =>
      b.id === batchId
        ? { ...b, remainingQuantity: b.remainingQuantity - quantity }
        : b
    );

    const updatedProducts = products.map((p) =>
      p.id === batch.productId
        ? { ...p, currentStock: stockAfter }
        : p
    );

    const newWaste: WasteRecord = {
      id: generateId(),
      productId: batch.productId,
      quantity,
      lossAmount: quantity * batch.purchasePrice,
      reason: normalizedReason,
      wasteDate: getTodayString(),
    };

    addInventoryLog({
      productId: product.id,
      productName: product.name,
      type: 'waste',
      typeName: '报损',
      quantityChange: -quantity,
      stockBefore,
      stockAfter,
      unitPrice: batch.purchasePrice,
      totalAmount: newWaste.lossAmount,
      reason: normalizedReason,
      batchId,
    });

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

  getTopSellingProducts: (limit = 10, month) => {
    const { sales, products, categories } = get();
    let start: string, end: string;

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);
      start = monthStart.toISOString().split('T')[0];
      end = monthEnd.toISOString().split('T')[0];
    } else {
      const range = getCurrentMonthRange();
      start = range.start;
      end = range.end;
    }

    const monthSales = sales.filter((s) => s.saleDate >= start && s.saleDate <= end);

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

  getWasteStatistics: (month, reason) => {
    const { waste, products, categories } = get();
    let start: string, end: string;

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);
      start = monthStart.toISOString().split('T')[0];
      end = monthEnd.toISOString().split('T')[0];
    } else {
      const range = getCurrentMonthRange();
      start = range.start;
      end = range.end;
    }

    let monthWaste = waste.filter((w) => w.wasteDate >= start && w.wasteDate <= end);

    if (reason) {
      monthWaste = monthWaste.filter((w) => w.reason === reason);
    }

    const productWaste = new Map<string, { quantity: number; lossAmount: number; reason: string }>();

    monthWaste.forEach((w) => {
      const current = productWaste.get(w.productId) || { quantity: 0, lossAmount: 0, reason: w.reason };
      productWaste.set(w.productId, {
        quantity: current.quantity + w.quantity,
        lossAmount: current.lossAmount + w.lossAmount,
        reason: w.reason,
      });
    });

    return Array.from(productWaste.entries())
      .map(([productId, data]) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return null;
        const category = categories.find((c) => c.id === product.categoryId);
        if (!category) return null;
        return {
          productId,
          productName: product.name,
          categoryName: category.name,
          quantity: data.quantity,
          lossAmount: data.lossAmount,
          reason: data.reason,
        };
      })
      .filter((item): item is WasteStatItem => item !== null)
      .sort((a, b) => b.lossAmount - a.lossAmount);
  },

  getWasteByReason: (month) => {
    const { waste, products, categories } = get();
    let start: string, end: string;

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);
      start = monthStart.toISOString().split('T')[0];
      end = monthEnd.toISOString().split('T')[0];
    } else {
      const range = getCurrentMonthRange();
      start = range.start;
      end = range.end;
    }

    const monthWaste = waste.filter((w) => w.wasteDate >= start && w.wasteDate <= end);

    const reasonMap = new Map<string, WasteByReason>();

    monthWaste.forEach((w) => {
      if (!reasonMap.has(w.reason)) {
        reasonMap.set(w.reason, {
          reason: w.reason,
          quantity: 0,
          lossAmount: 0,
          products: [],
        });
      }

      const reasonData = reasonMap.get(w.reason)!;
      reasonData.quantity += w.quantity;
      reasonData.lossAmount += w.lossAmount;

      const product = products.find((p) => p.id === w.productId);
      const category = product ? categories.find((c) => c.id === product.categoryId) : null;

      if (product && category) {
        const existingProduct = reasonData.products.find((p) => p.productId === w.productId);
        if (existingProduct) {
          existingProduct.quantity += w.quantity;
          existingProduct.lossAmount += w.lossAmount;
        } else {
          reasonData.products.push({
            productId: w.productId,
            productName: product.name,
            categoryName: category.name,
            quantity: w.quantity,
            lossAmount: w.lossAmount,
            reason: w.reason,
          });
        }
      }
    });

    return Array.from(reasonMap.values()).sort((a, b) => b.lossAmount - a.lossAmount);
  },

  getDailySalesTrend: (days = 30, month) => {
    const { sales } = get();
    const trend: DailySalesTrend[] = [];

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);

      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const daySales = sales.filter((s) => s.saleDate === dateStr);
        const revenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
        const quantity = daySales.reduce((sum, s) => sum + s.quantity, 0);

        trend.push({
          date: dateStr,
          revenue,
          quantity,
        });
      }
    } else {
      const today = getTodayString();
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

  getInventoryLogs: (filter) => {
    const { inventoryLogs, products } = get();
    let logs = [...inventoryLogs];

    if (filter?.productId && filter.productId !== 'all') {
      logs = logs.filter((l) => l.productId === filter.productId);
    }

    if (filter?.type && filter.type !== 'all') {
      logs = logs.filter((l) => l.type === filter.type);
    }

    if (filter?.startDate) {
      logs = logs.filter((l) => l.createdAt.slice(0, 10) >= filter.startDate!);
    }

    if (filter?.endDate) {
      logs = logs.filter((l) => l.createdAt.slice(0, 10) <= filter.endDate!);
    }

    return logs.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getMonthlyProfit: (months = 6) => {
    const { sales, batches, waste } = get();
    const result: ProfitMonthly[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      const startStr = monthStart.toISOString().split('T')[0];
      const endStr = monthEnd.toISOString().split('T')[0];

      const monthSales = sales.filter((s) => s.saleDate >= startStr && s.saleDate <= endStr);
      const revenue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);

      const monthBatches = batches.filter((b) => b.purchaseDate >= startStr && b.purchaseDate <= endStr);
      const cost = monthBatches.reduce((sum, b) => sum + b.quantity * b.purchasePrice, 0);

      const monthWaste = waste.filter((w) => w.wasteDate >= startStr && w.wasteDate <= endStr);
      const wasteLoss = monthWaste.reduce((sum, w) => sum + w.lossAmount, 0);

      const grossProfit = revenue - cost - wasteLoss;
      const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

      result.push({
        month: monthStr,
        revenue,
        cost,
        wasteLoss,
        grossProfit,
        grossMargin,
      });
    }

    return result;
  },

  getProductProfit: (month) => {
    const { sales, products, categories, batches, waste } = get();
    let start: string, end: string;

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);
      start = monthStart.toISOString().split('T')[0];
      end = monthEnd.toISOString().split('T')[0];
    } else {
      const range = getCurrentMonthRange();
      start = range.start;
      end = range.end;
    }

    const monthSales = sales.filter((s) => s.saleDate >= start && s.saleDate <= end);
    const monthWaste = waste.filter((w) => w.wasteDate >= start && w.wasteDate <= end);

    const productSales = new Map<string, { quantity: number; revenue: number }>();
    monthSales.forEach((sale) => {
      const current = productSales.get(sale.productId) || { quantity: 0, revenue: 0 };
      productSales.set(sale.productId, {
        quantity: current.quantity + sale.quantity,
        revenue: current.revenue + sale.totalAmount,
      });
    });

    const productWaste = new Map<string, { lossAmount: number }>();
    monthWaste.forEach((w) => {
      const current = productWaste.get(w.productId) || { lossAmount: 0 };
      productWaste.set(w.productId, { lossAmount: current.lossAmount + w.lossAmount });
    });

    const productCostMap = new Map<string, number>();
    products.forEach((p) => {
      const productBatches = batches.filter((b) => b.productId === p.id);
      if (productBatches.length > 0) {
        const latestBatch = productBatches.sort(
          (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
        )[0];
        productCostMap.set(p.id, latestBatch.purchasePrice);
      }
    });

    return products
      .map((product) => {
        const salesData = productSales.get(product.id) || { quantity: 0, revenue: 0 };
        const wasteData = productWaste.get(product.id) || { lossAmount: 0 };
        const unitCost = productCostMap.get(product.id) || 0;
        const category = categories.find((c) => c.id === product.categoryId);

        if (salesData.quantity === 0 && wasteData.lossAmount === 0) return null;

        const cost = salesData.quantity * unitCost;
        const grossProfit = salesData.revenue - cost - wasteData.lossAmount;
        const grossMargin = salesData.revenue > 0 ? (grossProfit / salesData.revenue) * 100 : 0;

        return {
          productId: product.id,
          productName: product.name,
          categoryName: category?.name || '未知',
          quantity: salesData.quantity,
          revenue: salesData.revenue,
          cost,
          wasteLoss: wasteData.lossAmount,
          grossProfit,
          grossMargin,
        };
      })
      .filter((item): item is ProfitProduct => item !== null)
      .sort((a, b) => b.revenue - a.revenue);
  },

  getSmartRestockList: () => {
    const { products, suppliers, sales, batches } = get();
    const today = getTodayString();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startStr = thirtyDaysAgo.toISOString().split('T')[0];

    const recentSales = sales.filter((s) => s.saleDate >= startStr && s.saleDate <= today);
    const productSalesMap = new Map<string, number>();

    recentSales.forEach((sale) => {
      const current = productSalesMap.get(sale.productId) || 0;
      productSalesMap.set(sale.productId, current + sale.quantity);
    });

    const productCostMap = new Map<string, number>();
    products.forEach((p) => {
      const supplier = suppliers.find((s) => s.id === p.supplierId);
      if (supplier?.lastPrice) {
        productCostMap.set(p.id, supplier.lastPrice);
      } else {
        const productBatches = batches.filter((b) => b.productId === p.id);
        if (productBatches.length > 0) {
          const latestBatch = productBatches.sort(
            (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
          )[0];
          productCostMap.set(p.id, latestBatch.purchasePrice);
        }
      }
    });

    const restockProducts = products.filter((p) => {
      const totalSales = productSalesMap.get(p.id) || 0;
      const avgDailySales = totalSales / 30;
      const estimatedDaysLeft = avgDailySales > 0 ? p.currentStock / avgDailySales : Infinity;

      return (
        p.currentStock <= p.stockThreshold ||
        (avgDailySales > 0 && estimatedDaysLeft <= 7)
      );
    });

    const groups = new Map<string, SmartRestockGroup>();

    restockProducts.forEach((product) => {
      const supplier = suppliers.find((s) => s.id === product.supplierId);
      if (!supplier) return;

      const totalSales = productSalesMap.get(product.id) || 0;
      const avgDailySales = totalSales / 30;
      const estimatedDaysLeft = avgDailySales > 0 ? product.currentStock / avgDailySales : 999;
      const lastPurchasePrice = productCostMap.get(product.id) || product.sellingPrice * 0.6;

      const suggestedQuantity = Math.max(
        product.stockThreshold * 2 - product.currentStock,
        product.stockThreshold,
        Math.ceil(avgDailySales * 14) - product.currentStock
      );
      const suggestedPurchaseAmount = suggestedQuantity * lastPurchasePrice;

      if (!groups.has(supplier.id)) {
        groups.set(supplier.id, {
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierPhone: supplier.phone,
          items: [],
          totalSuggestedAmount: 0,
        });
      }

      const group = groups.get(supplier.id)!;
      group.items.push({
        productId: product.id,
        productName: product.name,
        currentStock: product.currentStock,
        stockThreshold: product.stockThreshold,
        suggestedQuantity: Math.max(suggestedQuantity, 0),
        sellingPrice: product.sellingPrice,
        avgDailySales: Math.round(avgDailySales * 100) / 100,
        estimatedDaysLeft: Math.round(estimatedDaysLeft * 10) / 10,
        suggestedPurchaseAmount: Math.round(suggestedPurchaseAmount * 100) / 100,
        lastPurchasePrice,
      });
      group.totalSuggestedAmount += Math.round(suggestedPurchaseAmount * 100) / 100;
    });

    return Array.from(groups.values());
  },
}));
