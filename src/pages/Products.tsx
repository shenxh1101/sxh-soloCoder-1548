import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/dateUtils';
import { ProductWithDetails } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductFormData {
  name: string;
  categoryId: string;
  supplierId: string;
  shelfLifeDays: string;
  stockThreshold: string;
  sellingPrice: string;
}

interface FormErrors {
  name?: string;
  categoryId?: string;
  supplierId?: string;
  shelfLifeDays?: string;
  stockThreshold?: string;
  sellingPrice?: string;
}

export default function Products() {
  const {
    categories,
    suppliers,
    getProductWithDetails,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    categoryId: '',
    supplierId: '',
    shelfLifeDays: '',
    stockThreshold: '',
    sellingPrice: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const products = getProductWithDetails();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || product.categoryId === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const getStockStatus = (product: ProductWithDetails) => {
    if (product.currentStock <= 0) {
      return { status: 'out', label: '缺货', color: 'bg-red-500' };
    }
    if (product.currentStock <= product.stockThreshold) {
      return { status: 'low', label: '不足', color: 'bg-amber-500' };
    }
    return { status: 'normal', label: '正常', color: 'bg-green-500' };
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = '请输入商品名称';
    }

    if (!formData.categoryId) {
      errors.categoryId = '请选择商品分类';
    }

    if (!formData.supplierId) {
      errors.supplierId = '请选择供应商';
    }

    const shelfLifeDays = parseInt(formData.shelfLifeDays);
    if (!formData.shelfLifeDays || isNaN(shelfLifeDays) || shelfLifeDays <= 0) {
      errors.shelfLifeDays = '请输入有效的保质期天数';
    }

    const stockThreshold = parseInt(formData.stockThreshold);
    if (!formData.stockThreshold || isNaN(stockThreshold) || stockThreshold < 0) {
      errors.stockThreshold = '请输入有效的库存阈值';
    }

    const sellingPrice = parseFloat(formData.sellingPrice);
    if (!formData.sellingPrice || isNaN(sellingPrice) || sellingPrice <= 0) {
      errors.sellingPrice = '请输入有效的售价';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (product?: ProductWithDetails) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        shelfLifeDays: product.shelfLifeDays.toString(),
        stockThreshold: product.stockThreshold.toString(),
        sellingPrice: product.sellingPrice.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        categoryId: '',
        supplierId: '',
        shelfLifeDays: '',
        stockThreshold: '',
        sellingPrice: '',
      });
    }
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: '',
      supplierId: '',
      shelfLifeDays: '',
      stockThreshold: '',
      sellingPrice: '',
    });
    setFormErrors({});
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const productData = {
      name: formData.name.trim(),
      categoryId: formData.categoryId,
      supplierId: formData.supplierId,
      shelfLifeDays: parseInt(formData.shelfLifeDays),
      stockThreshold: parseInt(formData.stockThreshold),
      sellingPrice: parseFloat(formData.sellingPrice),
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  const categoryTabs = [
    { id: 'all', name: '全部', color: '#F97316' },
    ...categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">商品管理</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  共 {products.length} 个商品，{filteredProducts.length} 个结果
                </p>
              </div>
            </div>
            <Button onClick={() => handleOpenDialog()} className="w-full lg:w-auto">
              <Plus className="h-4 w-4" />
              新增商品
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full lg:flex-1">
              <TabsList className="flex flex-wrap h-auto bg-transparent p-0 gap-2">
                {categoryTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      'data-[state=active]:shadow-md data-[state=active]:scale-105',
                      activeCategory === tab.id
                        ? 'text-white'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    )}
                    style={
                      activeCategory === tab.id
                        ? { backgroundColor: tab.color }
                        : undefined
                    }
                  >
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索商品名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">暂无商品数据</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || activeCategory !== 'all'
                  ? '没有找到符合条件的商品，请尝试其他筛选条件'
                  : '点击"新增商品"按钮添加第一个商品'}
              </p>
              {!searchTerm && activeCategory === 'all' && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4" />
                  新增商品
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">商品名称</TableHead>
                    <TableHead className="font-semibold">分类</TableHead>
                    <TableHead className="font-semibold">供应商</TableHead>
                    <TableHead className="font-semibold">保质期(天)</TableHead>
                    <TableHead className="font-semibold">售价</TableHead>
                    <TableHead className="font-semibold">当前库存</TableHead>
                    <TableHead className="font-semibold">库存阈值</TableHead>
                    <TableHead className="font-semibold">状态</TableHead>
                    <TableHead className="font-semibold text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <TableRow key={product.id} className="group hover:bg-orange-50/50 transition-colors">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge
                            className="text-white font-medium"
                            style={{ backgroundColor: product.categoryColor }}
                          >
                            {product.categoryName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.supplierName}
                        </TableCell>
                        <TableCell>{product.shelfLifeDays}</TableCell>
                        <TableCell className="font-semibold text-orange-600">
                          ¥{product.sellingPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'font-semibold',
                              stockStatus.status === 'out' && 'text-red-600',
                              stockStatus.status === 'low' && 'text-amber-600',
                              stockStatus.status === 'normal' && 'text-green-600'
                            )}
                          >
                            {product.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.stockThreshold}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'h-2.5 w-2.5 rounded-full',
                                  stockStatus.color
                                )}
                              />
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  stockStatus.status === 'out' && 'text-red-600',
                                  stockStatus.status === 'low' && 'text-amber-600',
                                  stockStatus.status === 'normal' && 'text-green-600'
                                )}
                              >
                                {stockStatus.label}
                              </span>
                            </div>
                            {product.nearestExpiryDate && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                {product.daysUntilNearestExpiry !== undefined &&
                                  product.daysUntilNearestExpiry <= 7 && (
                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                  )}
                                最近过期: {formatDate(product.nearestExpiryDate)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(product)}
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmId(product.id)}
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingProduct ? '编辑商品' : '新增商品'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? '修改商品信息，点击保存确认更改'
                : '填写商品信息，点击保存添加新商品'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                商品名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="请输入商品名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn(formErrors.name && 'border-red-500 focus-visible:ring-red-500')}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  商品分类 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger
                    id="category"
                    className={cn(formErrors.categoryId && 'border-red-500 focus-visible:ring-red-500')}
                  >
                    <SelectValue placeholder="请选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.categoryId && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {formErrors.categoryId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">
                  供应商 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                >
                  <SelectTrigger
                    id="supplier"
                    className={cn(formErrors.supplierId && 'border-red-500 focus-visible:ring-red-500')}
                  >
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
                {formErrors.supplierId && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {formErrors.supplierId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shelfLife">
                  保质期(天) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="shelfLife"
                  type="number"
                  min="1"
                  placeholder="例如: 365"
                  value={formData.shelfLifeDays}
                  onChange={(e) => setFormData({ ...formData, shelfLifeDays: e.target.value })}
                  className={cn(formErrors.shelfLifeDays && 'border-red-500 focus-visible:ring-red-500')}
                />
                {formErrors.shelfLifeDays && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {formErrors.shelfLifeDays}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">
                  库存阈值 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  placeholder="例如: 20"
                  value={formData.stockThreshold}
                  onChange={(e) => setFormData({ ...formData, stockThreshold: e.target.value })}
                  className={cn(formErrors.stockThreshold && 'border-red-500 focus-visible:ring-red-500')}
                />
                {formErrors.stockThreshold && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {formErrors.stockThreshold}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                售价(元) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ¥
                </span>
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className={cn(
                    'pl-8',
                    formErrors.sellingPrice && 'border-red-500 focus-visible:ring-red-500'
                  )}
                />
              </div>
              {formErrors.sellingPrice && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formErrors.sellingPrice}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              <CheckCircle className="h-4 w-4" />
              {editingProduct ? '保存修改' : '确认添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              确认删除
            </DialogTitle>
            <DialogDescription>
              此操作将永久删除该商品及其相关数据，删除后无法恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              <Trash2 className="h-4 w-4" />
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
