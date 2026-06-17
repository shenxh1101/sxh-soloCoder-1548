import {
  Category,
  Supplier,
  Product,
  InventoryBatch,
  SaleRecord,
  WasteRecord,
  Promotion,
} from '@/types';
import { generateId, getTodayString, addDaysToDate } from './dateUtils';
import { calculateExpiryDate } from './expiryUtils';

export function generateMockCategories(): Category[] {
  return [
    { id: 'cat_1', name: '饮料', color: '#3B82F6' },
    { id: 'cat_2', name: '零食', color: '#F59E0B' },
    { id: 'cat_3', name: '面包', color: '#EC4899' },
    { id: 'cat_4', name: '牛奶', color: '#10B981' },
    { id: 'cat_5', name: '日用品', color: '#8B5CF6' },
  ];
}

export function generateMockSuppliers(): Supplier[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'sup_1',
      name: '康师傅饮料批发',
      phone: '13800138001',
      contact: '张经理',
      category: '饮料',
      lastPrice: 2.5,
      lastPurchaseDate: addDaysToDate(new Date(), -7),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sup_2',
      name: '旺旺食品代理',
      phone: '13800138002',
      contact: '李总',
      category: '零食',
      lastPrice: 3.2,
      lastPurchaseDate: addDaysToDate(new Date(), -5),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sup_3',
      name: '桃李面包配送',
      phone: '13800138003',
      contact: '王师傅',
      category: '面包',
      lastPrice: 4.5,
      lastPurchaseDate: addDaysToDate(new Date(), -1),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sup_4',
      name: '蒙牛乳业经销',
      phone: '13800138004',
      contact: '刘经理',
      category: '牛奶',
      lastPrice: 5.0,
      lastPurchaseDate: addDaysToDate(new Date(), -3),
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function generateMockProducts(): Product[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'prod_1',
      name: '康师傅冰红茶 500ml',
      categoryId: 'cat_1',
      supplierId: 'sup_1',
      shelfLifeDays: 365,
      stockThreshold: 20,
      sellingPrice: 3.5,
      currentStock: 25,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_2',
      name: '农夫山泉 550ml',
      categoryId: 'cat_1',
      supplierId: 'sup_1',
      shelfLifeDays: 730,
      stockThreshold: 30,
      sellingPrice: 2.0,
      currentStock: 8,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_3',
      name: '旺旺雪饼 84g',
      categoryId: 'cat_2',
      supplierId: 'sup_2',
      shelfLifeDays: 270,
      stockThreshold: 15,
      sellingPrice: 5.5,
      currentStock: 18,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_4',
      name: '奥利奥饼干 97g',
      categoryId: 'cat_2',
      supplierId: 'sup_2',
      shelfLifeDays: 365,
      stockThreshold: 12,
      sellingPrice: 8.9,
      currentStock: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_5',
      name: '桃李全麦面包 400g',
      categoryId: 'cat_3',
      supplierId: 'sup_3',
      shelfLifeDays: 7,
      stockThreshold: 10,
      sellingPrice: 6.5,
      currentStock: 12,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_6',
      name: '手撕面包 120g',
      categoryId: 'cat_3',
      supplierId: 'sup_3',
      shelfLifeDays: 5,
      stockThreshold: 15,
      sellingPrice: 4.5,
      currentStock: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_7',
      name: '蒙牛纯牛奶 250ml',
      categoryId: 'cat_4',
      supplierId: 'sup_4',
      shelfLifeDays: 45,
      stockThreshold: 24,
      sellingPrice: 3.0,
      currentStock: 16,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_8',
      name: '特仑苏纯牛奶 250ml',
      categoryId: 'cat_4',
      supplierId: 'sup_4',
      shelfLifeDays: 180,
      stockThreshold: 12,
      sellingPrice: 6.0,
      currentStock: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_9',
      name: '可口可乐 330ml',
      categoryId: 'cat_1',
      supplierId: 'sup_1',
      shelfLifeDays: 365,
      stockThreshold: 24,
      sellingPrice: 2.5,
      currentStock: 30,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_10',
      name: '乐事薯片 75g',
      categoryId: 'cat_2',
      supplierId: 'sup_2',
      shelfLifeDays: 270,
      stockThreshold: 15,
      sellingPrice: 7.5,
      currentStock: 22,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function generateMockBatches(): InventoryBatch[] {
  const now = new Date().toISOString();
  const today = getTodayString();

  return [
    {
      id: 'batch_1',
      productId: 'prod_1',
      quantity: 24,
      remainingQuantity: 25,
      productionDate: addDaysToDate(today, -100),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -100), 365),
      purchasePrice: 2.5,
      supplierId: 'sup_1',
      purchaseDate: addDaysToDate(today, -95),
      createdAt: now,
    },
    {
      id: 'batch_2',
      productId: 'prod_2',
      quantity: 24,
      remainingQuantity: 8,
      productionDate: addDaysToDate(today, -200),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -200), 730),
      purchasePrice: 1.2,
      supplierId: 'sup_1',
      purchaseDate: addDaysToDate(today, -180),
      createdAt: now,
    },
    {
      id: 'batch_3',
      productId: 'prod_5',
      quantity: 15,
      remainingQuantity: 12,
      productionDate: addDaysToDate(today, -2),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -2), 7),
      purchasePrice: 4.0,
      supplierId: 'sup_3',
      purchaseDate: addDaysToDate(today, -1),
      createdAt: now,
    },
    {
      id: 'batch_4',
      productId: 'prod_6',
      quantity: 20,
      remainingQuantity: 3,
      productionDate: addDaysToDate(today, -3),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -3), 5),
      purchasePrice: 3.0,
      supplierId: 'sup_3',
      purchaseDate: addDaysToDate(today, -2),
      createdAt: now,
    },
    {
      id: 'batch_5',
      productId: 'prod_7',
      quantity: 24,
      remainingQuantity: 16,
      productionDate: addDaysToDate(today, -20),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -20), 45),
      purchasePrice: 2.2,
      supplierId: 'sup_4',
      purchaseDate: addDaysToDate(today, -15),
      createdAt: now,
    },
    {
      id: 'batch_6',
      productId: 'prod_8',
      quantity: 12,
      remainingQuantity: 4,
      productionDate: addDaysToDate(today, -100),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -100), 180),
      purchasePrice: 4.5,
      supplierId: 'sup_4',
      purchaseDate: addDaysToDate(today, -90),
      createdAt: now,
    },
    {
      id: 'batch_7',
      productId: 'prod_3',
      quantity: 20,
      remainingQuantity: 18,
      productionDate: addDaysToDate(today, -50),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -50), 270),
      purchasePrice: 3.2,
      supplierId: 'sup_2',
      purchaseDate: addDaysToDate(today, -45),
      createdAt: now,
    },
    {
      id: 'batch_8',
      productId: 'prod_4',
      quantity: 15,
      remainingQuantity: 5,
      productionDate: addDaysToDate(today, -100),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -100), 365),
      purchasePrice: 5.0,
      supplierId: 'sup_2',
      purchaseDate: addDaysToDate(today, -90),
      createdAt: now,
    },
    {
      id: 'batch_9',
      productId: 'prod_5',
      quantity: 10,
      remainingQuantity: 0,
      productionDate: addDaysToDate(today, -8),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -8), 7),
      purchasePrice: 4.0,
      supplierId: 'sup_3',
      purchaseDate: addDaysToDate(today, -7),
      createdAt: now,
    },
    {
      id: 'batch_10',
      productId: 'prod_9',
      quantity: 30,
      remainingQuantity: 30,
      productionDate: addDaysToDate(today, -30),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -30), 365),
      purchasePrice: 1.8,
      supplierId: 'sup_1',
      purchaseDate: addDaysToDate(today, -25),
      createdAt: now,
    },
    {
      id: 'batch_11',
      productId: 'prod_10',
      quantity: 25,
      remainingQuantity: 22,
      productionDate: addDaysToDate(today, -40),
      expiryDate: calculateExpiryDate(addDaysToDate(today, -40), 270),
      purchasePrice: 4.5,
      supplierId: 'sup_2',
      purchaseDate: addDaysToDate(today, -35),
      createdAt: now,
    },
  ];
}

export function generateMockSales(): SaleRecord[] {
  const today = getTodayString();
  const records: SaleRecord[] = [];

  const salesData = [
    { productId: 'prod_1', avgQty: 5, price: 3.5 },
    { productId: 'prod_2', avgQty: 8, price: 2.0 },
    { productId: 'prod_3', avgQty: 4, price: 5.5 },
    { productId: 'prod_4', avgQty: 3, price: 8.9 },
    { productId: 'prod_5', avgQty: 10, price: 6.5 },
    { productId: 'prod_6', avgQty: 12, price: 4.5 },
    { productId: 'prod_7', avgQty: 6, price: 3.0 },
    { productId: 'prod_8', avgQty: 4, price: 6.0 },
    { productId: 'prod_9', avgQty: 7, price: 2.5 },
    { productId: 'prod_10', avgQty: 5, price: 7.5 },
  ];

  for (let day = 29; day >= 0; day--) {
    const date = addDaysToDate(today, -day);
    const isPromotionDay = day >= 7 && day <= 14;

    salesData.forEach((item, idx) => {
      const baseQty = Math.floor(Math.random() * item.avgQty * 0.5) + Math.floor(item.avgQty * 0.5);
      const qty = isPromotionDay && (idx === 5 || idx === 6)
        ? baseQty * 2
        : baseQty;

      if (qty > 0) {
        records.push({
          id: generateId(),
          productId: item.productId,
          quantity: qty,
          unitPrice: item.price,
          totalAmount: qty * item.price,
          saleDate: date,
          promotionId: isPromotionDay && (idx === 5 || idx === 6) ? 'promo_1' : undefined,
        });
      }
    });
  }

  return records;
}

export function generateMockWaste(): WasteRecord[] {
  const today = getTodayString();

  return [
    {
      id: 'waste_1',
      productId: 'prod_5',
      quantity: 3,
      lossAmount: 19.5,
      reason: '过期未售出',
      wasteDate: addDaysToDate(today, -1),
    },
    {
      id: 'waste_2',
      productId: 'prod_6',
      quantity: 2,
      lossAmount: 9.0,
      reason: '过期未售出',
      wasteDate: addDaysToDate(today, -2),
    },
    {
      id: 'waste_3',
      productId: 'prod_7',
      quantity: 1,
      lossAmount: 3.0,
      reason: '包装破损',
      wasteDate: addDaysToDate(today, -5),
    },
    {
      id: 'waste_4',
      productId: 'prod_3',
      quantity: 2,
      lossAmount: 11.0,
      reason: '过期未售出',
      wasteDate: addDaysToDate(today, -10),
    },
    {
      id: 'waste_5',
      productId: 'prod_5',
      quantity: 2,
      lossAmount: 13.0,
      reason: '过期未售出',
      wasteDate: addDaysToDate(today, -15),
    },
  ];
}

export function generateMockPromotions(): Promotion[] {
  const today = getTodayString();

  return [
    {
      id: 'promo_1',
      name: '夏季牛奶面包特惠',
      type: 'buy_one_get_one',
      buyQuantity: 1,
      freeQuantity: 1,
      startDate: addDaysToDate(today, -14),
      endDate: addDaysToDate(today, -7),
      isActive: false,
      productIds: ['prod_6', 'prod_7'],
    },
    {
      id: 'promo_2',
      name: '周末零食狂欢',
      type: 'discount',
      buyQuantity: 2,
      freeQuantity: 0,
      discountPercent: 20,
      startDate: addDaysToDate(today, -1),
      endDate: addDaysToDate(today, 6),
      isActive: true,
      productIds: ['prod_3', 'prod_4', 'prod_10'],
    },
  ];
}
