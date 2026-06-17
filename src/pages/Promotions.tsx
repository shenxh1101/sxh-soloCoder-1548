import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  TrendingDown,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useStore } from '@/store';
import { formatDate } from '@/utils/dateUtils';
import { Promotion, PromotionAnalysis, PromotionType } from '@/types';

export default function Promotions() {
  const {
    promotions,
    products,
    addPromotion,
    updatePromotion,
    deletePromotion,
    getPromotionAnalysis,
  } = useStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [analysisData, setAnalysisData] = useState<PromotionAnalysis[]>([]);
  const [analysisPromotion, setAnalysisPromotion] = useState<Promotion | null>(null);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<PromotionType>('buy_one_get_one');
  const [formBuyQuantity, setFormBuyQuantity] = useState(1);
  const [formFreeQuantity, setFormFreeQuantity] = useState(1);
  const [formDiscountPercent, setFormDiscountPercent] = useState(10);
  const [formStartDate, setFormStartDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'));
  const [formEndDate, setFormEndDate] = useState(formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [formProductIds, setFormProductIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const newCountdowns: Record<string, string> = {};
      
      promotions.forEach((promo) => {
        if (promo.isActive) {
          const end = new Date(promo.endDate);
          end.setHours(23, 59, 59, 999);
          const diff = end.getTime() - now.getTime();
          
          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            if (days > 0) {
              newCountdowns[promo.id] = `${days}天 ${hours}时 ${minutes}分`;
            } else {
              newCountdowns[promo.id] = `${hours}时 ${minutes}分 ${seconds}秒`;
            }
          }
        }
      });
      
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [promotions]);

  const activePromotions = promotions.filter((p) => p.isActive);
  const endedPromotions = promotions.filter((p) => !p.isActive);

  const resetForm = () => {
    setFormName('');
    setFormType('buy_one_get_one');
    setFormBuyQuantity(1);
    setFormFreeQuantity(1);
    setFormDiscountPercent(10);
    setFormStartDate(formatDate(new Date(), 'yyyy-MM-dd'));
    setFormEndDate(formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
    setFormProductIds([]);
    setEditingPromotion(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormName(promotion.name);
    setFormType(promotion.type);
    setFormBuyQuantity(promotion.buyQuantity);
    setFormFreeQuantity(promotion.freeQuantity);
    setFormDiscountPercent(promotion.discountPercent || 10);
    setFormStartDate(promotion.startDate);
    setFormEndDate(promotion.endDate);
    setFormProductIds([...promotion.productIds]);
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formName.trim() || formProductIds.length === 0) return;

    const promotionData = {
      name: formName,
      type: formType,
      buyQuantity: formType === 'buy_one_get_one' ? formBuyQuantity : 0,
      freeQuantity: formType === 'buy_one_get_one' ? formFreeQuantity : 0,
      discountPercent: formType === 'discount' ? formDiscountPercent : undefined,
      startDate: formStartDate,
      endDate: formEndDate,
      isActive: new Date(formStartDate) <= new Date() && new Date(formEndDate) >= new Date(),
      productIds: formProductIds,
    };

    if (editingPromotion) {
      updatePromotion(editingPromotion.id, promotionData);
    } else {
      addPromotion(promotionData);
    }

    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个促销活动吗？')) {
      deletePromotion(id);
    }
  };

  const handleViewAnalysis = (promotion: Promotion) => {
    const data = getPromotionAnalysis(promotion.id);
    setAnalysisData(data);
    setAnalysisPromotion(promotion);
    setIsAnalysisDialogOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    setFormProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const getPromotionTypeLabel = (type: PromotionType) => {
    switch (type) {
      case 'buy_one_get_one':
        return '买一送一';
      case 'discount':
        return '折扣';
      case 'bundle':
        return '组合套餐';
      default:
        return type;
    }
  };

  const getPromotionTypeBadgeColor = (type: PromotionType) => {
    switch (type) {
      case 'buy_one_get_one':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'discount':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'bundle':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTotalIncrease = () => {
    const totalPromoSales = analysisData.reduce((sum, d) => sum + d.promotionSales, 0);
    const totalNormalSales = analysisData.reduce((sum, d) => sum + d.normalSales, 0);
    if (totalNormalSales === 0) return totalPromoSales > 0 ? 100 : 0;
    return Math.round(((totalPromoSales - totalNormalSales) / totalNormalSales) * 100);
  };

  const getTotalRevenue = () => {
    return analysisData.reduce((sum, d) => sum + d.promotionRevenue, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Tag className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold">促销活动</h1>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          新建活动
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            进行中 ({activePromotions.length})
          </TabsTrigger>
          <TabsTrigger value="ended">
            已结束 ({endedPromotions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activePromotions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无进行中的促销活动
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activePromotions.map((promotion) => (
                <Card
                  key={promotion.id}
                  className="relative overflow-hidden border-2 border-green-400 shadow-lg animate-pulse-soft"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400" />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold">
                        {promotion.name}
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        进行中
                      </Badge>
                    </div>
                    <CardDescription>
                      <Badge
                        className={`mt-2 ${getPromotionTypeBadgeColor(promotion.type)}`}
                      >
                        {getPromotionTypeLabel(promotion.type)}
                        {promotion.type === 'buy_one_get_one' &&
                          ` 买${promotion.buyQuantity}送${promotion.freeQuantity}`}
                        {promotion.type === 'discount' &&
                          ` ${promotion.discountPercent}% OFF`}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatDate(promotion.startDate)} ~ {formatDate(promotion.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="font-semibold text-orange-600">
                        倒计时: {countdowns[promotion.id] || '计算中...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>参与商品: {promotion.productIds.length} 件</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(promotion)}
                      >
                        <Edit className="h-4 w-4" />
                        编辑
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(promotion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        删除
                      </Button>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewAnalysis(promotion)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      查看效果
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ended" className="mt-6">
          {endedPromotions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无已结束的促销活动
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {endedPromotions.map((promotion) => (
                <Card
                  key={promotion.id}
                  className="border-gray-200 bg-gray-50/50 opacity-90"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold text-gray-600">
                        {promotion.name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                        已结束
                      </Badge>
                    </div>
                    <CardDescription>
                      <Badge
                        className={`mt-2 opacity-70 ${getPromotionTypeBadgeColor(promotion.type)}`}
                      >
                        {getPromotionTypeLabel(promotion.type)}
                        {promotion.type === 'buy_one_get_one' &&
                          ` 买${promotion.buyQuantity}送${promotion.freeQuantity}`}
                        {promotion.type === 'discount' &&
                          ` ${promotion.discountPercent}% OFF`}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-gray-500">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(promotion.startDate)} ~ {formatDate(promotion.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4" />
                      <span>参与商品: {promotion.productIds.length} 件</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        onClick={() => openEditDialog(promotion)}
                      >
                        <Edit className="h-4 w-4" />
                        编辑
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(promotion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        删除
                      </Button>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleViewAnalysis(promotion)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      查看效果
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? '编辑促销活动' : '新建促销活动'}
            </DialogTitle>
            <DialogDescription>
              填写促销活动信息，设置活动规则和参与商品
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">活动名称</Label>
              <Input
                id="name"
                placeholder="请输入活动名称"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">开始日期</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">结束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">活动类型</Label>
              <Select
                value={formType}
                onValueChange={(value) => setFormType(value as PromotionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择活动类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy_one_get_one">买一送一</SelectItem>
                  <SelectItem value="discount">折扣</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formType === 'buy_one_get_one' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyQuantity">购买数量</Label>
                  <Input
                    id="buyQuantity"
                    type="number"
                    min="1"
                    value={formBuyQuantity}
                    onChange={(e) => setFormBuyQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freeQuantity">赠送数量</Label>
                  <Input
                    id="freeQuantity"
                    type="number"
                    min="1"
                    value={formFreeQuantity}
                    onChange={(e) => setFormFreeQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            )}

            {formType === 'discount' && (
              <div className="space-y-2">
                <Label htmlFor="discountPercent">折扣百分比 (%)</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  min="1"
                  max="99"
                  value={formDiscountPercent}
                  onChange={(e) => setFormDiscountPercent(parseInt(e.target.value) || 10)}
                />
              </div>
            )}

            <div className="space-y-3">
              <Label>选择参与商品</Label>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={formProductIds.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                    />
                    <Label
                      htmlFor={`product-${product.id}`}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      {product.name}
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      ¥{product.sellingPrice}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                已选择 {formProductIds.length} 件商品
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formName.trim() || formProductIds.length === 0}
            >
              {editingPromotion ? '保存修改' : '创建活动'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              活动效果分析
            </DialogTitle>
            <DialogDescription>
              {analysisPromotion && (
                <span>
                  {analysisPromotion.name} - {formatDate(analysisPromotion.startDate)} ~ {formatDate(analysisPromotion.endDate)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {analysisPromotion && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">总销量增长</div>
                    <div className={`text-2xl font-bold mt-1 flex items-center gap-1 ${getTotalIncrease() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getTotalIncrease() >= 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      {getTotalIncrease() >= 0 ? '+' : ''}{getTotalIncrease()}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">活动期间收入</div>
                    <div className="text-2xl font-bold mt-1 text-orange-600">
                      ¥{getTotalRevenue().toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">商品效果明细</h3>
                <div className="space-y-4">
                  {analysisData.map((item) => {
                    const maxSales = Math.max(item.promotionSales, item.normalSales, 1);
                    const promoWidth = (item.promotionSales / maxSales) * 100;
                    const normalWidth = (item.normalSales / maxSales) * 100;

                    return (
                      <Card key={item.productId} className="overflow-hidden">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="font-semibold">{item.productName}</div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${item.increasePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.increasePercent >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {item.increasePercent >= 0 ? '+' : ''}{item.increasePercent}%
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-orange-600 font-medium">活动期间销量: {item.promotionSales} 件</span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                                  style={{ width: `${promoWidth}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500 font-medium">平时销量: {item.normalSales} 件</span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full transition-all duration-500"
                                  style={{ width: `${normalWidth}%` }}
                                />
                              </div>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">活动期间收入</span>
                                <span className="font-semibold text-orange-600">¥{item.promotionRevenue.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsAnalysisDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
