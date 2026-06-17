import React, { useEffect, useState } from 'react';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Trash2,
  Percent,
  Plus,
  ArrowDownToLine,
  Receipt,
  Phone,
  Clock,
  TrendingUp,
  X,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import { formatDate, formatDateChinese, getCurrentMonthRange } from '@/utils/dateUtils';
import { getExpiryStatusColor, getExpiryStatusText } from '@/utils/expiryUtils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { BatchWithProduct, RestockGroup, RestockItem } from '@/types';

type DialogType = 'addProduct' | 'quickStock' | 'recordSale' | null;

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  selectedBatch?: BatchWithProduct;
  selectedRestockItem?: RestockItem;
  supplierId?: string;
}

export default function Dashboard() {
  const {
    products,
    sales,
    initData,
    getExpiringBatches,
    getRestockList,
    addBatch,
    addSale,
    markBatchAsWaste,
    updateBatch,
  } = useStore();

  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    type: null,
  });

  const [formData, setFormData] = useState({
    quantity: '',
    purchasePrice: '',
    salePrice: '',
    productId: '',
    reason: '',
    discountPrice: '',
  });

  useEffect(() => {
    initData();
  }, [initData]);

  const expiringBatches = getExpiringBatches(3);
  const restockGroups = getRestockList();
  const { start } = getCurrentMonthRange();

  const totalProducts = products.length;
  const expiringCount = expiringBatches.length;
  const restockCount = restockGroups.reduce((sum, g) => sum + g.items.length, 0);
  const monthlySales = sales
    .filter((s) => s.saleDate >= start)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const handleOpenDialog = (type: DialogType, data?: Partial<DialogState>) => {
    setDialogState({ isOpen: true, type, ...data });
    setFormData({
      quantity: '',
      purchasePrice: '',
      salePrice: '',
      productId: '',
      reason: '',
      discountPrice: '',
    });
  };

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, type: null });
  };

  const handleMarkAsWaste = () => {
    if (!dialogState.selectedBatch) return;
    const reason = formData.reason || '过期未售出';
    markBatchAsWaste(
      dialogState.selectedBatch.id,
      dialogState.selectedBatch.remainingQuantity,
      reason
    );
    handleCloseDialog();
  };

  const handleDiscountProcess = () => {
    if (!dialogState.selectedBatch || !formData.discountPrice) return;
    const product = products.find((p) => p.id === dialogState.selectedBatch!.productId);
    if (product) {
      updateBatch(dialogState.selectedBatch.id, {
        purchasePrice: parseFloat(formData.discountPrice),
      });
    }
    handleCloseDialog();
  };

  const handleQuickStock = () => {
    const productId = dialogState.selectedRestockItem?.productId || formData.productId;
    
    if (
      !productId ||
      !formData.quantity ||
      !formData.purchasePrice
    )
      return;

    const supplierId =
      dialogState.supplierId ||
      products.find((p) => p.id === productId)?.supplierId;

    if (!supplierId) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    addBatch({
      productId,
      quantity: parseInt(formData.quantity),
      productionDate: formatDate(new Date()),
      purchasePrice: parseFloat(formData.purchasePrice),
      supplierId,
      purchaseDate: formatDate(new Date()),
    });
    handleCloseDialog();
  };

  const handleRecordSale = () => {
    if (!formData.productId || !formData.quantity || !formData.salePrice) return;

    const product = products.find((p) => p.id === formData.productId);
    const qty = parseInt(formData.quantity);
    const price = parseFloat(formData.salePrice);

    if (!product || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) return;

    if (qty > product.currentStock) {
      alert(`库存不足！当前可用库存仅 ${product.currentStock} 件`);
      return;
    }

    try {
      addSale({
        productId: formData.productId,
        quantity: qty,
        unitPrice: price,
        saleDate: formatDate(new Date()),
      });
      handleCloseDialog();
    } catch (error: any) {
      alert(error.message || '销售记录失败，请重试');
    }
  };

  const handleAddProduct = () => {
    handleCloseDialog();
  };

  const handleCallSupplier = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const statCards = [
    {
      title: '商品总数',
      value: totalProducts,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      delay: 0,
    },
    {
      title: '3天内过期',
      value: expiringCount,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
      delay: 100,
      showWarning: expiringCount > 0,
    },
    {
      title: '待补货',
      value: restockCount,
      icon: ShoppingCart,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      delay: 200,
      showWarning: restockCount > 0,
    },
    {
      title: '本月销售额',
      value: `¥${monthlySales.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      delay: 300,
      suffix: <TrendingUp className="h-4 w-4 text-success ml-1" />,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            便利店管理系统
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatDateChinese(new Date())} · 实时数据概览
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card
            key={index}
            className={cn(
              'overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1',
              card.showWarning && 'animate-pulse-soft',
              card.borderColor && `border-2 ${card.borderColor}`
            )}
            style={{
              animation: `fadeIn 0.5s ease-out ${card.delay}ms both`,
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {card.title}
                  </p>
                  <div className="flex items-center mt-2">
                    <p className="text-3xl font-bold text-foreground">
                      {card.value}
                    </p>
                    {card.suffix}
                  </div>
                </div>
                <div
                  className={cn(
                    'p-3 rounded-xl',
                    card.bgColor
                  )}
                >
                  <card.icon className={cn('h-6 w-6', card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="overflow-hidden"
          style={{ animation: 'fadeIn 0.5s ease-out 400ms both' }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                即将过期商品
              </CardTitle>
              <Badge variant="destructive">{expiringCount} 个批次</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {expiringBatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success/50" />
                <p>暂无即将过期商品</p>
              </div>
            ) : (
              expiringBatches.map((batch, index) => (
                <div
                  key={batch.id}
                  className={cn(
                    'p-4 rounded-xl border-2 border-destructive/30 bg-destructive/5 transition-all duration-300 hover:border-destructive/50 hover:shadow-md',
                    batch.daysUntilExpiry <= 1 && 'animate-pulse-soft'
                  )}
                  style={{ animation: `fadeIn 0.4s ease-out ${500 + index * 100}ms both` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground truncate">
                          {batch.productName}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: batch.categoryColor + '20',
                            color: batch.categoryColor,
                            borderColor: batch.categoryColor + '40',
                          }}
                        >
                          {batch.categoryName}
                        </Badge>
                        <Badge
                          className={cn(
                            'text-xs',
                            getExpiryStatusColor(batch.expiryStatus)
                          )}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {getExpiryStatusText(
                            batch.expiryStatus,
                            batch.daysUntilExpiry
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>剩余: {batch.remainingQuantity} 件</span>
                        <span>过期: {formatDate(batch.expiryDate, 'MM/dd')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleOpenDialog('recordSale', { selectedBatch: batch })
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        报损
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() =>
                          handleOpenDialog('quickStock', { selectedBatch: batch })
                        }
                      >
                        <Percent className="h-4 w-4 mr-1" />
                        打折
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card
          className="overflow-hidden"
          style={{ animation: 'fadeIn 0.5s ease-out 500ms both' }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5 text-warning" />
                补货提醒
              </CardTitle>
              <Badge variant="warning">{restockCount} 个商品</Badge>
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto scrollbar-thin">
            {restockGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success/50" />
                <p>暂无需要补货的商品</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {restockGroups.map((group: RestockGroup) => (
                  <AccordionItem
                    key={group.supplierId}
                    value={group.supplierId}
                    className="border-2 border-warning/30 rounded-xl px-4 mb-2 bg-warning/5 data-[state=open]:bg-warning/10 transition-all"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {group.supplierName}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-warning/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCallSupplier(group.supplierPhone);
                              }}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              {group.supplierPhone}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="warning">{group.items.length} 种</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pb-2">
                        {group.items.map((item) => (
                          <div
                            key={item.productId}
                            className="p-3 rounded-lg bg-background border border-warning/20"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-foreground truncate">
                                  {item.productName}
                                </h5>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <span>
                                    当前库存:{' '}
                                    <span className="text-destructive font-medium">
                                      {item.currentStock}
                                    </span>
                                  </span>
                                  <span>
                                    阈值: {item.stockThreshold}
                                  </span>
                                  <span>
                                    建议补货:{' '}
                                    <span className="text-success font-medium">
                                      {item.suggestedQuantity}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleOpenDialog('quickStock', {
                                    selectedRestockItem: item,
                                    supplierId: group.supplierId,
                                  })
                                }
                              >
                                <ArrowDownToLine className="h-4 w-4 mr-1" />
                                入库
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>

      <Card
        className="overflow-hidden"
        style={{ animation: 'fadeIn 0.5s ease-out 600ms both' }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-primary" />
            快捷操作
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              variant="default"
              size="lg"
              className="h-auto py-6 flex flex-col gap-2 group"
              onClick={() => handleOpenDialog('addProduct')}
            >
              <div className="p-3 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                <Package className="h-6 w-6" />
              </div>
              <span className="font-semibold">新增商品</span>
              <span className="text-xs opacity-80">添加新的商品信息</span>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-auto py-6 flex flex-col gap-2 group bg-secondary hover:bg-secondary/80"
              onClick={() => handleOpenDialog('quickStock')}
            >
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <ArrowDownToLine className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-foreground">快速入库</span>
              <span className="text-xs text-muted-foreground">记录商品入库</span>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-auto py-6 flex flex-col gap-2 group bg-secondary hover:bg-secondary/80"
              onClick={() => handleOpenDialog('recordSale')}
            >
              <div className="p-3 rounded-full bg-success/10 group-hover:bg-success/20 transition-colors">
                <Receipt className="h-6 w-6 text-success" />
              </div>
              <span className="font-semibold text-foreground">记录销售</span>
              <span className="text-xs text-muted-foreground">添加销售记录</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogState.isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogState.type === 'addProduct' && '新增商品'}
              {dialogState.type === 'quickStock' && dialogState.selectedRestockItem
                ? `补货: ${dialogState.selectedRestockItem.productName}`
                : dialogState.type === 'quickStock' && dialogState.selectedBatch
                ? `打折处理: ${dialogState.selectedBatch.productName}`
                : dialogState.type === 'quickStock'
                ? '快速入库'
                : null}
              {dialogState.type === 'recordSale' && dialogState.selectedBatch
                ? `报损处理: ${dialogState.selectedBatch.productName}`
                : dialogState.type === 'recordSale'
                ? '记录销售'
                : null}
            </DialogTitle>
            <DialogDescription>
              {dialogState.type === 'addProduct' && '填写商品基本信息'}
              {dialogState.type === 'quickStock' && dialogState.selectedBatch
                ? '设置打折后的价格'
                : dialogState.type === 'quickStock'
                ? '填写入库数量和进价'
                : null}
              {dialogState.type === 'recordSale' && dialogState.selectedBatch
                ? '确认报损信息'
                : dialogState.type === 'recordSale'
                ? '填写销售信息'
                : null}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {dialogState.type === 'addProduct' && (
              <div className="text-center py-8 text-muted-foreground">
                请前往商品管理页面添加商品
              </div>
            )}

            {dialogState.type === 'quickStock' && dialogState.selectedBatch && (
              <>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">商品名称</span>
                    <span className="font-medium">
                      {dialogState.selectedBatch.productName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">剩余数量</span>
                    <span className="font-medium">
                      {dialogState.selectedBatch.remainingQuantity} 件
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">原进价</span>
                    <span className="font-medium">
                      ¥{dialogState.selectedBatch.purchasePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">折扣后单价 (元)</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPrice: e.target.value })
                    }
                    placeholder="请输入折扣后单价"
                  />
                </div>
              </>
            )}

            {dialogState.type === 'quickStock' &&
              !dialogState.selectedBatch &&
              dialogState.selectedRestockItem && (
                <>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">商品名称</span>
                      <span className="font-medium">
                        {dialogState.selectedRestockItem.productName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">当前库存</span>
                      <span className="font-medium text-destructive">
                        {dialogState.selectedRestockItem.currentStock} 件
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">建议补货</span>
                      <span className="font-medium text-success">
                        {dialogState.selectedRestockItem.suggestedQuantity} 件
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">入库数量</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      placeholder={
                        dialogState.selectedRestockItem.suggestedQuantity.toString()
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">进货单价 (元)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, purchasePrice: e.target.value })
                      }
                      placeholder="请输入进货单价"
                    />
                  </div>
                </>
              )}

            {dialogState.type === 'quickStock' &&
              !dialogState.selectedBatch &&
              !dialogState.selectedRestockItem && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="productId">选择商品</Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, productId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择商品" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">入库数量</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      placeholder="请输入入库数量"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">进货单价 (元)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, purchasePrice: e.target.value })
                      }
                      placeholder="请输入进货单价"
                    />
                  </div>
                </>
              )}

            {dialogState.type === 'recordSale' && dialogState.selectedBatch && (
              <>
                <div className="p-4 rounded-lg bg-destructive/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">商品名称</span>
                    <span className="font-medium">
                      {dialogState.selectedBatch.productName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">报损数量</span>
                    <span className="font-medium text-destructive">
                      {dialogState.selectedBatch.remainingQuantity} 件
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">损失金额</span>
                    <span className="font-medium text-destructive">
                      ¥
                      {(
                        dialogState.selectedBatch.remainingQuantity *
                        dialogState.selectedBatch.purchasePrice
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">报损原因</Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) =>
                      setFormData({ ...formData, reason: value })
                    }
                    defaultValue="过期未售出"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择报损原因" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="过期未售出">过期未售出</SelectItem>
                      <SelectItem value="包装破损">包装破损</SelectItem>
                      <SelectItem value="质量问题">质量问题</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {dialogState.type === 'recordSale' && !dialogState.selectedBatch && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="productId">选择商品</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => {
                      const product = products.find((p) => p.id === value);
                      setFormData({
                        ...formData,
                        productId: value,
                        salePrice: product?.sellingPrice.toString() || '',
                      });
                    }}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="quantity">
                    销售数量
                    {formData.productId && (
                      <span className="text-muted-foreground ml-2">
                        (库存: {products.find((p) => p.id === formData.productId)?.currentStock || 0} 件)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={formData.productId ? products.find((p) => p.id === formData.productId)?.currentStock || undefined : undefined}
                    value={formData.quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (formData.productId) {
                        const max = products.find((p) => p.id === formData.productId)?.currentStock || 0;
                        if (parseInt(val) > max) {
                          setFormData({ ...formData, quantity: max.toString() });
                          return;
                        }
                      }
                      setFormData({ ...formData, quantity: val });
                    }}
                    placeholder="请输入销售数量"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">销售单价 (元)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, salePrice: e.target.value })
                    }
                    placeholder="请输入销售单价"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            {dialogState.type === 'quickStock' && dialogState.selectedBatch && (
              <Button
                variant="warning"
                onClick={handleDiscountProcess}
                disabled={!formData.discountPrice}
              >
                <Percent className="h-4 w-4 mr-2" />
                确认打折
              </Button>
            )}
            {dialogState.type === 'quickStock' && !dialogState.selectedBatch && (
              <Button
                variant="default"
                onClick={handleQuickStock}
                disabled={
                  !formData.quantity ||
                  !formData.purchasePrice ||
                  (!formData.productId && !dialogState.selectedRestockItem)
                }
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                确认入库
              </Button>
            )}
            {dialogState.type === 'recordSale' && dialogState.selectedBatch && (
              <Button variant="destructive" onClick={handleMarkAsWaste}>
                <Trash2 className="h-4 w-4 mr-2" />
                确认报损
              </Button>
            )}
            {dialogState.type === 'recordSale' && !dialogState.selectedBatch && (
              <Button
                variant="default"
                onClick={handleRecordSale}
                disabled={
                  !formData.productId || !formData.quantity || !formData.salePrice
                }
              >
                <Receipt className="h-4 w-4 mr-2" />
                确认销售
              </Button>
            )}
            {dialogState.type === 'addProduct' && (
              <Button variant="default" onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                去添加
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
