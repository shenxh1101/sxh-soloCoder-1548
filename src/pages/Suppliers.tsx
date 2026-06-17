import { useState } from 'react';
import {
  Phone,
  Plus,
  Edit,
  Trash2,
  User,
  Building,
  ShoppingCart,
  Clock,
} from 'lucide-react';
import { useStore } from '@/store';
import { Supplier, RestockItem } from '@/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import Empty from '@/components/Empty';

interface SupplierFormData {
  name: string;
  phone: string;
  contact: string;
  category: string;
}

const initialFormData: SupplierFormData = {
  name: '',
  phone: '',
  contact: '',
  category: '',
};

export default function Suppliers() {
  const {
    suppliers,
    products,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getRestockList,
  } = useStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>(initialFormData);
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, boolean>>(new Map());

  const restockList = getRestockList();

  const getSupplierProducts = (supplierId: string) => {
    return products
      .filter((p) => p.supplierId === supplierId)
      .map((product) => {
        const suggestedQuantity = Math.max(
          product.stockThreshold * 2 - product.currentStock,
          product.stockThreshold
        );
        return {
          productId: product.id,
          productName: product.name,
          currentStock: product.currentStock,
          stockThreshold: product.stockThreshold,
          suggestedQuantity,
          sellingPrice: product.sellingPrice,
        } as RestockItem;
      });
  };

  const getSupplierRestockItems = (supplierId: string) => {
    const group = restockList.find((g) => g.supplierId === supplierId);
    return group?.items || [];
  };

  const isSupplierActive = (supplier: Supplier) => {
    const supplierProducts = products.filter((p) => p.supplierId === supplier.id);
    return supplierProducts.length > 0;
  };

  const handleAddClick = () => {
    setEditingSupplier(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      contact: supplier.contact,
      category: supplier.category,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (supplierId: string) => {
    if (confirm('确定要删除该供应商吗？')) {
      deleteSupplier(supplierId);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.contact || !formData.category) {
      alert('请填写所有必填字段');
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData);
    } else {
      addSupplier(formData);
    }

    setIsDialogOpen(false);
    setFormData(initialFormData);
    setEditingSupplier(null);
  };

  const handleQuickOrderToggle = (supplierId: string) => {
    if (expandedSupplierId === supplierId) {
      setExpandedSupplierId(null);
      setSelectedProducts(new Map());
    } else {
      setExpandedSupplierId(supplierId);
      const supplierProducts = getSupplierProducts(supplierId);
      const newSelected = new Map<string, boolean>();
      supplierProducts.forEach((item) => {
        newSelected.set(item.productId, true);
      });
      setSelectedProducts(newSelected);
    }
  };

  const handleProductSelect = (productId: string, checked: boolean) => {
    const newSelected = new Map(selectedProducts);
    newSelected.set(productId, checked);
    setSelectedProducts(newSelected);
  };

  const handleGenerateOrder = (supplierId: string) => {
    const supplierProducts = getSupplierProducts(supplierId);
    const selectedItems = supplierProducts.filter(
      (item) => selectedProducts.get(item.productId)
    );

    if (selectedItems.length === 0) {
      alert('请至少选择一个商品');
      return;
    }

    const totalQuantity = selectedItems.reduce((sum, item) => sum + item.suggestedQuantity, 0);
    const orderDetails = selectedItems
      .map((item) => `${item.productName} × ${item.suggestedQuantity}`)
      .join('\n');

    alert(
      `订货清单已生成：\n\n${orderDetails}\n\n总计：${selectedItems.length} 种商品，${totalQuantity} 件`
    );

    setExpandedSupplierId(null);
    setSelectedProducts(new Map());
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">供应商管理</h1>
        <Button onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-2" />
          新增供应商
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <Empty
          icon={<Building className="w-12 h-12 text-muted-foreground" />}
          title="暂无供应商"
          description="点击右上角按钮添加第一个供应商"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => {
            const isActive = isSupplierActive(supplier);
            const supplierProducts = getSupplierProducts(supplier.id);
            const restockItems = getSupplierRestockItems(supplier.id);
            const isExpanded = expandedSupplierId === supplier.id;

            return (
              <Card
                key={supplier.id}
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    </div>
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? '活跃' : '未活跃'}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline">{supplier.category}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">联系人：</span>
                    <span className="font-medium">{supplier.contact}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">电话：</span>
                    <a
                      href={`tel:${supplier.phone}`}
                      className="font-medium text-green-600 hover:text-green-700 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {supplier.phone}
                    </a>
                  </div>

                  {supplier.lastPrice && supplier.lastPurchaseDate && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">最近进货</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">上次进货价</div>
                          <div className="font-semibold">¥{supplier.lastPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">进货日期</div>
                          <div className="font-semibold">{supplier.lastPurchaseDate}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {restockItems.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <Badge variant="destructive" className="text-xs">
                        {restockItems.length} 种商品需要补货
                      </Badge>
                    </div>
                  )}

                  <Accordion
                    type="single"
                    collapsible
                    value={isExpanded ? 'quick-order' : ''}
                    onValueChange={(value) => {
                      if (value === 'quick-order') {
                        handleQuickOrderToggle(supplier.id);
                      } else {
                        setExpandedSupplierId(null);
                        setSelectedProducts(new Map());
                      }
                    }}
                  >
                    <AccordionItem value="quick-order" className="border-none">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          <span>快速下单</span>
                          {restockItems.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {restockItems.length}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {supplierProducts.length === 0 ? (
                          <div className="text-sm text-muted-foreground py-4 text-center">
                            该供应商暂无商品
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                            {supplierProducts.map((item) => {
                              const needsRestock = item.currentStock <= item.stockThreshold;
                              return (
                                <div
                                  key={item.productId}
                                  className={`p-3 rounded-lg border ${
                                    needsRestock
                                      ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900'
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      id={`product-${item.productId}`}
                                      checked={selectedProducts.get(item.productId) ?? true}
                                      onCheckedChange={(checked) =>
                                        handleProductSelect(item.productId, checked as boolean)
                                      }
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <Label
                                        htmlFor={`product-${item.productId}`}
                                        className="font-medium cursor-pointer block truncate"
                                      >
                                        {item.productName}
                                      </Label>
                                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                                        <div>
                                          <span className="text-muted-foreground">库存：</span>
                                          <span
                                            className={`font-semibold ${
                                              needsRestock ? 'text-red-600 dark:text-red-400' : ''
                                            }`}
                                          >
                                            {item.currentStock}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">阈值：</span>
                                          <span className="font-semibold">{item.stockThreshold}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">建议：</span>
                                          <span className="font-semibold text-primary">
                                            {item.suggestedQuantity}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {supplierProducts.length > 0 && (
                          <Button
                            className="w-full mt-4"
                            onClick={() => handleGenerateOrder(supplier.id)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            生成订货清单
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(supplier)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClick(supplier.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    asChild
                  >
                    <a href={`tel:${supplier.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      拨打
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? '编辑供应商' : '新增供应商'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">供应商名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入供应商名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">联系电话</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入联系电话"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">联系人</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="请输入联系人"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">主营品类</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="请输入主营品类，如：饮料、零食"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingSupplier ? '保存修改' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
