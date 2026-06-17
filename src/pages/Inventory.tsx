import React, { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  TrendingUp,
  History,
  Clock,
  ArrowRight,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import { calculateExpiryDate } from '@/utils/expiryUtils';
import { getTodayString, formatDateTime } from '@/utils/dateUtils';
import {
  getExpiryStatus,
  getExpiryStatusText,
  getDaysUntilExpiry,
} from '@/utils/expiryUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import type { InventoryBatch, ExpiryStatus, InventoryLog } from '@/types';

interface BatchWithDetails extends InventoryBatch {
  productName: string;
  supplierName: string;
  expiryStatus: ExpiryStatus;
  daysUntilExpiry: number;
}

export default function Inventory() {
  const {
    batches,
    products,
    suppliers,
    promotions,
    addBatch,
    addSale,
    markBatchAsWaste,
  } = useStore();

  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [inboundProduct, setInboundProduct] = useState<string>('');
  const [inboundSupplier, setInboundSupplier] = useState<string>('');
  const [inboundQuantity, setInboundQuantity] = useState<number>(1);
  const [inboundProductionDate, setInboundProductionDate] = useState<string>(getTodayString());
  const [inboundPurchasePrice, setInboundPurchasePrice] = useState<string>('');
  const [inboundPurchaseDate, setInboundPurchaseDate] = useState<string>(getTodayString());
  const [showInboundSuccess, setShowInboundSuccess] = useState(false);

  const [outboundProduct, setOutboundProduct] = useState<string>('');
  const [outboundQuantity, setOutboundQuantity] = useState<number>(1);
  const [outboundUnitPrice, setOutboundUnitPrice] = useState<string>('');
  const [outboundSaleDate, setOutboundSaleDate] = useState<string>(getTodayString());
  const [outboundIsPromotion, setOutboundIsPromotion] = useState<boolean>(false);
  const [outboundPromotionId, setOutboundPromotionId] = useState<string>('');
  const [showOutboundSuccess, setShowOutboundSuccess] = useState(false);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchWithDetails | null>(null);

  const enrichedBatches = useMemo<BatchWithDetails[]>(() => {
    return batches
      .filter((b) => b.remainingQuantity > 0)
      .map((batch) => {
        const product = products.find((p) => p.id === batch.productId);
        const supplier = suppliers.find((s) => s.id === batch.supplierId);
        const expiryStatus = getExpiryStatus(batch.expiryDate);
        const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);

        return {
          ...batch,
          productName: product?.name || '未知商品',
          supplierName: supplier?.name || '未知供应商',
          expiryStatus,
          daysUntilExpiry,
        };
      });
  }, [batches, products, suppliers]);

  const filteredBatches = useMemo(() => {
    return enrichedBatches.filter((batch) => {
      const matchProduct = selectedProduct === 'all' ? true : batch.productId === selectedProduct;
      const matchStatus =
        selectedStatus === 'all'
          ? true
          : batch.expiryStatus === selectedStatus;
      return matchProduct && matchStatus;
    });
  }, [enrichedBatches, selectedProduct, selectedStatus]);

  const sortedBatches = useMemo(() => {
    return [...filteredBatches].sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
  }, [filteredBatches]);

  const calculatedExpiryDate = useMemo(() => {
    if (!inboundProduct || !inboundProductionDate) return '';
    const product = products.find((p) => p.id === inboundProduct);
    if (!product) return '';
    return calculateExpiryDate(inboundProductionDate, product.shelfLifeDays);
  }, [inboundProduct, inboundProductionDate, products]);

  const activePromotions = useMemo(() => {
    return promotions.filter(
      (p) =>
        p.isActive &&
        p.startDate <= getTodayString() &&
        p.endDate >= getTodayString()
    );
  }, [promotions]);

  const availableStock = useMemo(() => {
    if (!outboundProduct) return 0;
    return enrichedBatches
      .filter((b) => b.productId === outboundProduct)
      .reduce((sum, b) => sum + b.remainingQuantity, 0);
  }, [outboundProduct, enrichedBatches]);

  const handleProductChangeForOutbound = (productId: string) => {
    setOutboundProduct(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setOutboundUnitPrice(product.sellingPrice.toString());
    }
    setOutboundPromotionId('');
    setOutboundIsPromotion(false);
  };

  const handleInboundSubmit = () => {
    if (!inboundProduct || !inboundSupplier || inboundQuantity <= 0 || !inboundPurchasePrice || !inboundProductionDate) {
      return;
    }

    addBatch({
      productId: inboundProduct,
      supplierId: inboundSupplier,
      quantity: inboundQuantity,
      productionDate: inboundProductionDate,
      purchasePrice: parseFloat(inboundPurchasePrice),
      purchaseDate: inboundPurchaseDate,
    });

    setShowInboundSuccess(true);
    setTimeout(() => setShowInboundSuccess(false), 3000);

    setInboundProduct('');
    setInboundSupplier('');
    setInboundQuantity(1);
    setInboundProductionDate(getTodayString());
    setInboundPurchasePrice('');
    setInboundPurchaseDate(getTodayString());
  };

  const handleOutboundSubmit = () => {
    if (!outboundProduct || outboundQuantity <= 0 || !outboundUnitPrice || outboundQuantity > availableStock) {
      return;
    }

    addSale({
      productId: outboundProduct,
      quantity: outboundQuantity,
      unitPrice: parseFloat(outboundUnitPrice),
      saleDate: outboundSaleDate,
      promotionId: outboundIsPromotion && outboundPromotionId ? outboundPromotionId : undefined,
    });

    setShowOutboundSuccess(true);
    setTimeout(() => setShowOutboundSuccess(false), 3000);

    setOutboundProduct('');
    setOutboundQuantity(1);
    setOutboundUnitPrice('');
    setOutboundSaleDate(getTodayString());
    setOutboundIsPromotion(false);
    setOutboundPromotionId('');
  };

  const handleMarkAsExpired = (batch: BatchWithDetails) => {
    if (batch.remainingQuantity > 0) {
      markBatchAsWaste(batch.id, batch.remainingQuantity, '已过期');
    }
  };

  const handleViewDetail = (batch: BatchWithDetails) => {
    setSelectedBatch(batch);
    setDetailDialogOpen(true);
  };

  const getStatusBadge = (status: ExpiryStatus, days: number) => {
    const variant =
      status === 'expired'
        ? 'destructive'
        : status === 'warning'
        ? 'warning'
        : 'success';
    return (
      <Badge variant={variant}>
        {getExpiryStatusText(status, days)}
      </Badge>
    );
  };

  const QuantityStepper = ({
    value,
    onChange,
    min = 1,
  }: {
    value: number;
    onChange: (val: number) => void;
    min?: number;
  }) => (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(min, parseInt(e.target.value) || min))}
        className="w-20 text-center"
        min={min}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">库存管理</h1>
          <p className="text-muted-foreground mt-1">
            管理商品库存、入库和出库操作
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            库存列表
          </TabsTrigger>
          <TabsTrigger value="inbound" className="flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4" />
            快速入库
          </TabsTrigger>
          <TabsTrigger value="outbound" className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            快速出库
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>库存批次列表</CardTitle>
              <CardDescription>
                查看所有商品的库存批次信息和有效期状态
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-2">
                  <Label>商品筛选</Label>
                  <Select
                    value={selectedProduct}
                    onValueChange={setSelectedProduct}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="全部商品" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部商品</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>批次状态</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="全部状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="normal">正常</SelectItem>
                      <SelectItem value="warning">临期</SelectItem>
                      <SelectItem value="expired">已过期</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct('all');
                      setSelectedStatus('all');
                    }}
                  >
                    重置筛选
                  </Button>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名称</TableHead>
                      <TableHead>生产日期</TableHead>
                      <TableHead>过期日期</TableHead>
                      <TableHead>剩余数量</TableHead>
                      <TableHead>进货价</TableHead>
                      <TableHead>供应商</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBatches.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          暂无符合条件的库存批次
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedBatches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">
                            {batch.productName}
                          </TableCell>
                          <TableCell>{batch.productionDate}</TableCell>
                          <TableCell>{batch.expiryDate}</TableCell>
                          <TableCell>{batch.remainingQuantity}</TableCell>
                          <TableCell>¥{batch.purchasePrice.toFixed(2)}</TableCell>
                          <TableCell>{batch.supplierName}</TableCell>
                          <TableCell>
                            {getStatusBadge(
                              batch.expiryStatus,
                              batch.daysUntilExpiry
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {batch.expiryStatus !== 'expired' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleMarkAsExpired(batch)}
                                >
                                  标记过期
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetail(batch)}
                              >
                                查看详情
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbound" className="mt-6">
          <Card className="border-success/50">
            <CardHeader className="bg-success/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-success">
                <ArrowDownCircle className="h-5 w-5" />
                快速入库
              </CardTitle>
              <CardDescription>
                录入商品进货信息，系统将自动计算过期日期
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {showInboundSuccess && (
                <div className="bg-success/10 text-success border border-success/30 rounded-lg p-3 flex items-center gap-2 animate-fade-in">
                  <TrendingUp className="h-4 w-4" />
                  入库成功！库存已更新。
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inbound-product">选择商品 *</Label>
                  <Select
                    value={inboundProduct}
                    onValueChange={setInboundProduct}
                  >
                    <SelectTrigger id="inbound-product">
                      <SelectValue placeholder="请选择商品" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (保质期 {product.shelfLifeDays} 天)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inbound-supplier">选择供应商 *</Label>
                  <Select
                    value={inboundSupplier}
                    onValueChange={setInboundSupplier}
                  >
                    <SelectTrigger id="inbound-supplier">
                      <SelectValue placeholder="请选择供应商" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>进货数量 *</Label>
                  <QuantityStepper
                    value={inboundQuantity}
                    onChange={setInboundQuantity}
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inbound-price">进货价 (元) *</Label>
                  <Input
                    id="inbound-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={inboundPurchasePrice}
                    onChange={(e) => setInboundPurchasePrice(e.target.value)}
                    placeholder="请输入进货价"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inbound-production">生产日期 *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="inbound-production"
                      type="date"
                      value={inboundProductionDate}
                      onChange={(e) => setInboundProductionDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inbound-date">进货日期 *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="inbound-date"
                      type="date"
                      value={inboundPurchaseDate}
                      onChange={(e) => setInboundPurchaseDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {calculatedExpiryDate && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="text-sm font-medium">过期日期预览</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {calculatedExpiryDate}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {(() => {
                        const status = getExpiryStatus(calculatedExpiryDate);
                        const days = getDaysUntilExpiry(calculatedExpiryDate);
                        return getExpiryStatusText(status, days);
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                onClick={handleInboundSubmit}
                disabled={
                  !inboundProduct ||
                  !inboundSupplier ||
                  inboundQuantity <= 0 ||
                  !inboundPurchasePrice ||
                  !inboundProductionDate
                }
              >
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                确认入库
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="outbound" className="mt-6">
          <Card className="border-warning/50">
            <CardHeader className="bg-warning/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-warning">
                <ArrowUpCircle className="h-5 w-5" />
                快速出库
              </CardTitle>
              <CardDescription>
                录入商品销售信息，系统将自动扣减库存（先进先出）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {showOutboundSuccess && (
                <div className="bg-success/10 text-success border border-success/30 rounded-lg p-3 flex items-center gap-2 animate-fade-in">
                  <TrendingUp className="h-4 w-4" />
                  出库成功！库存已扣减。
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outbound-product">选择商品 *</Label>
                  <Select
                    value={outboundProduct}
                    onValueChange={handleProductChangeForOutbound}
                  >
                    <SelectTrigger id="outbound-product">
                      <SelectValue placeholder="请选择商品" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter((p) => p.currentStock > 0)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (库存: {product.currentStock})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>销售数量 *</Label>
                  <QuantityStepper
                    value={outboundQuantity}
                    onChange={setOutboundQuantity}
                    min={1}
                  />
                  {outboundProduct && outboundQuantity > availableStock && (
                    <p className="text-sm text-destructive">
                      库存不足！当前可用库存：{availableStock}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outbound-price">单价 (元) *</Label>
                  <Input
                    id="outbound-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={outboundUnitPrice}
                    onChange={(e) => setOutboundUnitPrice(e.target.value)}
                    placeholder="请输入销售单价"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outbound-date">销售日期 *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="outbound-date"
                      type="date"
                      value={outboundSaleDate}
                      onChange={(e) => setOutboundSaleDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is-promotion"
                      checked={outboundIsPromotion}
                      onChange={(e) => setOutboundIsPromotion(e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="is-promotion" className="cursor-pointer">
                      参与促销活动
                    </Label>
                  </div>

                  {outboundIsPromotion && (
                    <div className="pl-6 space-y-2">
                      <Label htmlFor="promotion-select">选择促销活动</Label>
                      <Select
                        value={outboundPromotionId}
                        onValueChange={setOutboundPromotionId}
                      >
                        <SelectTrigger id="promotion-select">
                          <SelectValue placeholder="请选择促销活动" />
                        </SelectTrigger>
                        <SelectContent>
                          {activePromotions.map((promo) => (
                            <SelectItem key={promo.id} value={promo.id}>
                              {promo.name} (
                              {promo.type === 'discount'
                                ? `${promo.discountPercent}% 折扣`
                                : promo.type === 'buy_one_get_one'
                                ? `买${promo.buyQuantity}赠${promo.freeQuantity}`
                                : '捆绑销售'}
                              )
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {outboundUnitPrice && outboundQuantity > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      销售金额合计
                    </span>
                    <span className="text-xl font-bold text-warning">
                      ¥
                      {(
                        parseFloat(outboundUnitPrice) * outboundQuantity
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                onClick={handleOutboundSubmit}
                disabled={
                  !outboundProduct ||
                  outboundQuantity <= 0 ||
                  !outboundUnitPrice ||
                  outboundQuantity > availableStock
                }
              >
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                确认出库
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批次详情</DialogTitle>
            <DialogDescription>
              查看库存批次的详细信息
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">商品名称</p>
                  <p className="font-medium">{selectedBatch.productName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">供应商</p>
                  <p className="font-medium">{selectedBatch.supplierName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">生产日期</p>
                  <p className="font-medium">{selectedBatch.productionDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">过期日期</p>
                  <p className="font-medium">{selectedBatch.expiryDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">进货数量</p>
                  <p className="font-medium">{selectedBatch.quantity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">剩余数量</p>
                  <p className="font-medium">{selectedBatch.remainingQuantity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">进货价</p>
                  <p className="font-medium">
                    ¥{selectedBatch.purchasePrice.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">进货日期</p>
                  <p className="font-medium">{selectedBatch.purchaseDate}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-muted-foreground">批次状态</p>
                  <div>
                    {getStatusBadge(
                      selectedBatch.expiryStatus,
                      selectedBatch.daysUntilExpiry
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
