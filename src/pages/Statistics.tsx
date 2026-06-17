import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Trophy,
  Medal,
  Package,
  DollarSign,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import { formatDateChinese } from '@/utils/dateUtils';

const CHART_COLORS = [
  '#F97316',
  '#FB923C',
  '#FDBA74',
  '#FED7AA',
  '#FFEDD5',
  '#3B82F6',
  '#60A5FA',
  '#93C5FD',
  '#BFDBFE',
  '#DBEAFE',
];

const PIE_COLORS = [
  '#F97316',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
];

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-sm shadow-lg">
        <Trophy className="w-4 h-4" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white font-bold text-sm shadow-lg">
        <Medal className="w-4 h-4" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm shadow-lg">
        <Medal className="w-4 h-4" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
      {rank}
    </div>
  );
}

export default function Statistics() {
  const {
    getTopSellingProducts,
    getWasteStatistics,
    getWasteByReason,
    getDailySalesTrend,
    getMonthlyProfit,
    getProductProfit,
    sales,
    waste,
  } = useStore();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const topProducts = useMemo(() => getTopSellingProducts(10, selectedMonth), [getTopSellingProducts, selectedMonth]);
  const wasteStats = useMemo(() => getWasteStatistics(selectedMonth), [getWasteStatistics, selectedMonth]);
  const wasteByReason = useMemo(() => getWasteByReason(selectedMonth), [getWasteByReason, selectedMonth]);
  const salesTrend = useMemo(() => getDailySalesTrend(30, selectedMonth), [getDailySalesTrend, selectedMonth]);
  const monthlyProfit = useMemo(() => getMonthlyProfit(6), [getMonthlyProfit]);
  const productProfit = useMemo(() => getProductProfit(selectedMonth), [getProductProfit, selectedMonth]);

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      options.push({ value, label });
    }
    return options;
  }, []);

  const totalSales = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    return sales
      .filter(
        (s) => s.saleDate >= monthStartStr && s.saleDate <= monthEndStr
      )
      .reduce((sum, s) => sum + s.totalAmount, 0);
  }, [sales, selectedMonth]);

  const totalQuantity = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    return sales
      .filter(
        (s) => s.saleDate >= monthStartStr && s.saleDate <= monthEndStr
      )
      .reduce((sum, s) => sum + s.quantity, 0);
  }, [sales, selectedMonth]);

  const totalWaste = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    return waste
      .filter(
        (w) => w.wasteDate >= monthStartStr && w.wasteDate <= monthEndStr
      )
      .reduce((sum, w) => sum + w.lossAmount, 0);
  }, [waste, selectedMonth]);

  const pieData = useMemo(() => {
    return wasteByReason.map((item) => ({
      name: item.reason,
      value: item.lossAmount,
    }));
  }, [wasteByReason]);

  const expiredWaste = useMemo(() => {
    const expired = wasteByReason.find((w) => w.reason === '过期未售出');
    return expired ? expired.lossAmount : 0;
  }, [wasteByReason]);

  const otherWaste = useMemo(() => {
    return wasteByReason
      .filter((w) => w.reason !== '过期未售出')
      .reduce((sum, w) => sum + w.lossAmount, 0);
  }, [wasteByReason]);

  const trendStats = useMemo(() => {
    const revenues = salesTrend.map((t) => t.revenue);
    const avg = revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0;
    const max = revenues.length > 0 ? Math.max(...revenues) : 0;
    const min = revenues.length > 0 ? Math.min(...revenues) : 0;
    return { avg, max, min };
  }, [salesTrend]);

  const currentMonthProfit = useMemo(() => {
    return monthlyProfit.find((m) => m.month === selectedMonth) || {
      month: selectedMonth,
      revenue: 0,
      cost: 0,
      wasteLoss: 0,
      grossProfit: 0,
      grossMargin: 0,
    };
  }, [monthlyProfit, selectedMonth]);

  const lowMarginProducts = useMemo(() => {
    return productProfit
      .filter((p) => p.quantity > 0 && p.grossMargin < 15)
      .sort((a, b) => a.grossMargin - b.grossMargin);
  }, [productProfit]);

  const chartTooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '12px',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">统计报表</h1>
          <p className="text-gray-500">查看便利店销售、销量和浪费数据</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择月份" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-100">
              <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              本月总销售额
            </div>
          </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ¥<AnimatedNumber value={Math.round(totalSales)} />
            </div>
            <p className="text-orange-100 text-sm mt-1">
              较上月 +12.5%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-100">
              <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              本月总销量
            </div>
          </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <AnimatedNumber value={totalQuantity} suffix=" 件" />
            </div>
            <p className="text-blue-100 text-sm mt-1">
              较上月 +8.3%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-100">
              <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              本月浪费金额
            </div>
          </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ¥<AnimatedNumber value={Math.round(totalWaste)} />
            </div>
            <p className="text-red-100 text-sm mt-1">
              较上月 -5.2%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="top-selling" className="w-full">
        <TabsList>
          <TabsTrigger value="top-selling">热销排行</TabsTrigger>
          <TabsTrigger value="profit-analysis">利润分析</TabsTrigger>
          <TabsTrigger value="waste-analysis">浪费分析</TabsTrigger>
          <TabsTrigger value="sales-trend">销售趋势</TabsTrigger>
        </TabsList>

        <TabsContent value="top-selling" className="space-y-6">
          <Card>
            <CardHeader>
            <CardTitle>{formatMonthLabel(selectedMonth)} 销量 Top10 商品</CardTitle>
            <CardDescription>
              展示销量最高的商品排行
            </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="productName"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value: number) => [`${value} 件`, '销量']}
                    />
                    <Legend />
                    <Bar
                      dataKey="quantity"
                      name="销量"
                      radius={[4, 4, 0, 0]}
                    >
                      {topProducts.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
            <CardTitle>详细数据</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">排名</TableHead>
                    <TableHead>商品名称</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead className="text-right">销量</TableHead>
                    <TableHead className="text-right">销售额</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((item, index) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <RankBadge rank={index + 1} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.quantity} 件
                      </TableCell>
                      <TableCell className="text-right font-medium text-orange-600">
                        ¥{item.revenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit-analysis" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardDescription className="text-orange-100 text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    销售额
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{currentMonthProfit.revenue.toFixed(0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardDescription className="text-blue-100 text-xs">
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    进货成本
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{currentMonthProfit.cost.toFixed(0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardDescription className="text-green-100 text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    毛利
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{currentMonthProfit.grossProfit.toFixed(0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardDescription className="text-purple-100 text-xs">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    毛利率
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMonthProfit.grossMargin.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>近6个月利润趋势</CardTitle>
              <CardDescription>
                销售额、成本、毛利变化趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyProfit}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const [, m] = value.split('-');
                        return `${parseInt(m)}月`;
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelFormatter={(value) => formatMonthLabel(value)}
                      formatter={(value: number) => [`¥${value.toFixed(0)}`, '']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="销售额"
                      stroke="#F97316"
                      strokeWidth={3}
                      dot={{ fill: '#F97316', r: 4 }}
                      activeDot={{ r: 6, fill: '#F97316' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      name="成本"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6, fill: '#3B82F6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="grossProfit"
                      name="毛利"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: '#10B981', r: 4 }}
                      activeDot={{ r: 6, fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {lowMarginProducts.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  低毛利商品预警
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  以下商品销量较高但毛利率低于15%，建议关注
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {lowMarginProducts.slice(0, 5).map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">{item.categoryName} · 销量 {item.quantity} 件</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${item.grossMargin < 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {item.grossMargin.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-500">毛利 ¥{item.grossProfit.toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{formatMonthLabel(selectedMonth)} 商品利润明细</CardTitle>
              <CardDescription>
                按销售额排序，可查看各商品的盈利情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品名称</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead className="text-right">销量</TableHead>
                    <TableHead className="text-right">销售额</TableHead>
                    <TableHead className="text-right">成本</TableHead>
                    <TableHead className="text-right">浪费损失</TableHead>
                    <TableHead className="text-right">毛利</TableHead>
                    <TableHead className="text-right">毛利率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productProfit.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity} 件
                      </TableCell>
                      <TableCell className="text-right text-orange-600 font-medium">
                        ¥{item.revenue.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-blue-600">
                        ¥{item.cost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        ¥{item.wasteLoss.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${item.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ¥{item.grossProfit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={item.grossMargin >= 20 ? 'default' : item.grossMargin >= 10 ? 'secondary' : 'destructive'}
                          className={item.grossMargin >= 20 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                        >
                          {item.grossMargin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waste-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{formatMonthLabel(selectedMonth)} 浪费原因占比</CardTitle>
                <CardDescription>
                  各原因浪费金额占比分析
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        formatter={(value: number) => [`¥${value.toFixed(2)}`, '损失金额']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>浪费汇总</CardTitle>
                <CardDescription>
                  本月浪费总金额
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-80">
                <div className="text-6xl font-bold text-red-500">
                  ¥{totalWaste.toFixed(2)}
                </div>
                <p className="text-gray-500 mt-4">
                  共 {wasteStats.length} 种商品产生浪费
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-500">过期未售出</p>
                    <p className="text-xl font-bold text-red-600">
                      ¥{expiredWaste.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-500">其他原因</p>
                    <p className="text-xl font-bold text-orange-600">
                      ¥{otherWaste.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {wasteByReason.map((reasonGroup, groupIndex) => (
            <Card key={reasonGroup.reason}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {reasonGroup.reason === '过期未售出' ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Package className="h-5 w-5 text-orange-500" />
                  )}
                  {reasonGroup.reason}
                  <Badge variant={reasonGroup.reason === '过期未售出' ? 'destructive' : 'secondary'}>
                    ¥{reasonGroup.lossAmount.toFixed(2)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  共浪费 {reasonGroup.quantity} 件，{reasonGroup.products.length} 种商品
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名称</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead className="text-right">浪费数量</TableHead>
                      <TableHead className="text-right">损失金额</TableHead>
                      <TableHead>原因</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reasonGroup.products.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">
                          {item.productName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.categoryName}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity} 件
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          ¥{item.lossAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.reason === '过期未售出' ? 'destructive' : 'secondary'}>
                            {item.reason}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

          {wasteByReason.length === 0 && (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                本月暂无浪费记录
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sales-trend" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-500">
                  平均日销售额
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ¥{trendStats.avg.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-500">
                  最高日销售额
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ¥{trendStats.max.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-500">
                  最低日销售额
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ¥{trendStats.min.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{formatMonthLabel(selectedMonth)} 销售额趋势</CardTitle>
              <CardDescription>
                每日销售额变化趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatDateChinese(value)}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelFormatter={(value) => formatDateChinese(value)}
                      formatter={(value: number) => [`¥${value.toFixed(2)}`, '销售额']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="销售额"
                      stroke="#F97316"
                      strokeWidth={3}
                      dot={{ fill: '#F97316', r: 4 }}
                      activeDot={{ r: 6, fill: '#F97316' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
