import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Gift, Target,
  ChevronDown, ChevronUp, Info, AlertCircle, CheckCircle, X,
  BarChart3, PieChart, LineChart, Repeat, ShoppingCart,
  Crown, Award, Sparkles, RefreshCw, Settings, Calculator
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as RechartsLineChart, Line, ComposedChart, Legend
} from 'recharts';
import { LoyaltyAnalyticsService, LoyaltyROIMetrics, RevenueBreakdown, CustomerBehaviorMetrics, ROISettings } from '../services/loyaltyAnalyticsService';
import { useAuth } from '../contexts/AuthContext';

interface LoyaltyROIDashboardProps {
  timeRange: string;
}

const LoyaltyROIDashboard: React.FC<LoyaltyROIDashboardProps> = ({ timeRange }) => {
  const [metrics, setMetrics] = useState<LoyaltyROIMetrics | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([]);
  const [behaviorMetrics, setBehaviorMetrics] = useState<CustomerBehaviorMetrics | null>(null);
  const [roiSettings, setROISettings] = useState<ROISettings | null>(null);
  const [showROISettings, setShowROISettings] = useState(false);
  const [showMoreInsights, setShowMoreInsights] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  
  const { restaurant } = useAuth();

  useEffect(() => {
    if (restaurant) {
      fetchLoyaltyMetrics();
    }
  }, [restaurant, timeRange]);

  const fetchLoyaltyMetrics = async () => {
    if (!restaurant) return;

    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(startDate.getDate() - days);

      const dateRange = { start: startDate, end: endDate };

      const [metricsData, revenueData, behaviorData] = await Promise.all([
        LoyaltyAnalyticsService.getLoyaltyROIMetrics(restaurant.id, dateRange),
        LoyaltyAnalyticsService.getRevenueBreakdown(restaurant.id, dateRange),
        LoyaltyAnalyticsService.getCustomerBehaviorMetrics(restaurant.id, dateRange),
        LoyaltyAnalyticsService.getROISettings(restaurant.id)
      ]);

      setMetrics(metricsData);
      setRevenueBreakdown(revenueData);
      setBehaviorMetrics(behaviorData);
      setROISettings(roiSettings);

    } catch (err: any) {
      console.error('Error fetching loyalty metrics:', err);
      setError(err.message || 'Failed to load loyalty metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveROISettings = async () => {
    if (!restaurant || !roiSettings) return;

    try {
      setSavingSettings(true);
      await LoyaltyAnalyticsService.updateROISettings(restaurant.id, roiSettings);
      await fetchLoyaltyMetrics(); // Refresh metrics with new settings
    } catch (error) {
      console.error('Error saving ROI settings:', error);
    } finally {
      setSavingSettings(false);
      setShowROISettings(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getROIBadge = (status: string) => {
    switch (status) {
      case 'high-performing':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'High Performing'
        };
      case 'profitable':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: TrendingUp,
          text: 'Profitable'
        };
      case 'losing-money':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle,
          text: 'Losing Money'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Info,
          text: 'No Data'
        };
    }
  };

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Loyalty Metrics</h3>
        <p className="text-red-700 mb-4">{error || 'Unknown error occurred'}</p>
        <button
          onClick={fetchLoyaltyMetrics}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  const roiBadge = getROIBadge(metrics.roiStatus);
  const BadgeIcon = roiBadge.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">Loyalty Program ROI</h2>
          <p className="text-gray-600">
            Financial impact and return on investment analysis
            {restaurant?.settings?.loyaltyMode && (
              <span className="ml-2 px-2 py-1 bg-gradient-to-r from-[#E6A85C]/20 via-[#E85A9B]/20 to-[#D946EF]/20 text-[#E6A85C] text-xs rounded-full border border-[#E6A85C]/30">
                {restaurant.settings.loyaltyMode === 'blanket' ? 'Blanket Mode' : 'Menu-Based Mode'}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLoyaltyMetrics}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowROISettings(true)}
            className="p-2 text-gray-600 hover:bg-gradient-to-r hover:from-[#E6A85C]/10 hover:via-[#E85A9B]/10 hover:to-[#D946EF]/10 hover:text-[#E6A85C] rounded-xl transition-all duration-300"
            title="ROI Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Primary ROI Card */}
      <div className="bg-gradient-to-br from-[#E6A85C] via-[#E85A9B] to-[#D946EF] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-white/90 mb-2 font-['Space_Grotesk']">Loyalty Program ROI</h3>
              <div className="flex items-center gap-4">
                <span className="text-6xl font-bold font-['Space_Grotesk'] drop-shadow-lg">{formatPercentage(metrics.roi)}</span>
                <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                  <div className="flex items-center gap-2">
                    <BadgeIcon className="h-5 w-5" />
                    <span className="text-sm font-bold">{roiBadge.text}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-2 shadow-xl">
                <img src="/image.png" alt="VOYA" className="h-12 w-auto object-contain" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-white/95 leading-relaxed font-medium">
              {metrics.roiSummaryText}
              {restaurant?.settings && (
                <span className="block mt-3 text-white/80 text-sm">
                  Point System: 1 point = {restaurant.settings.pointValueAED || 0.05} AED • 
                  Earning Rate: {restaurant.settings.pointsPerAED || 0.1} points per AED
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-[#E6A85C]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:from-[#E6A85C]/20 group-hover:to-[#E85A9B]/20 transition-all duration-300">
              <DollarSign className="h-6 w-6 text-green-600 group-hover:text-[#E6A85C] transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Gross Revenue</p>
              <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatCurrency(metrics.grossRevenue)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Total sales before redemptions</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-[#E6A85C]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:from-[#E6A85C]/20 group-hover:to-[#E85A9B]/20 transition-all duration-300">
              <Calculator className="h-6 w-6 text-blue-600 group-hover:text-[#E85A9B] transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Gross Profit</p>
              <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatCurrency(metrics.estimatedGrossProfit)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">Profit Margin:</p>
            <span className="text-xs font-medium text-[#E85A9B]">
              {metrics.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-[#E6A85C]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:from-[#E6A85C]/20 group-hover:to-[#D946EF]/20 transition-all duration-300">
              <Gift className="h-6 w-6 text-red-600 group-hover:text-[#D946EF] transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reward Cost</p>
              <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatCurrency(metrics.rewardCost)}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">{metrics.totalPointsRedeemed.toLocaleString()} points redeemed</p>
            <p className="text-xs text-gray-500">
              {metrics.rewardCostPercentage.toFixed(1)}% of revenue
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-[#E6A85C]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:from-[#E6A85C]/20 group-hover:to-[#E85A9B]/20 transition-all duration-300">
              <BarChart3 className="h-6 w-6 text-blue-600 group-hover:text-[#E6A85C] transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Revenue</p>
              <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatCurrency(metrics.netRevenue)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Revenue after redemptions</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-[#E6A85C]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center group-hover:from-[#E85A9B]/20 group-hover:to-[#D946EF]/20 transition-all duration-300">
              <TrendingUp className="h-6 w-6 text-purple-600 group-hover:text-[#D946EF] transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatCurrency(metrics.netProfit)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Final profit after all costs</p>
        </div>
      </div>

      {/* Revenue Breakdown Chart */}
      {revenueBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-['Space_Grotesk']">Revenue Breakdown</h3>
              <p className="text-sm text-gray-500">Monthly revenue and profit trends</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E6A85C]" />
                <span className="text-gray-600">Gross Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E85A9B]" />
                <span className="text-gray-600">Reward Cost</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#D946EF]" />
                <span className="text-gray-600">Net Profit</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  className="text-sm text-gray-500"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-sm text-gray-500"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={renderCustomTooltip} />
                <Bar 
                  dataKey="grossRevenue" 
                  fill="#E6A85C" 
                  radius={[4, 4, 0, 0]}
                  name="Gross Revenue"
                />
                <Bar 
                  dataKey="rewardCost" 
                  fill="#E85A9B" 
                  radius={[4, 4, 0, 0]}
                  name="Reward Cost"
                />
                <Line 
                  type="monotone" 
                  dataKey="netProfit" 
                  stroke="#D946EF" 
                  strokeWidth={3}
                  name="Net Profit"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-[#E6A85C]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:from-[#E6A85C]/20 group-hover:to-[#E85A9B]/20 transition-all duration-300">
              <Sparkles className="h-6 w-6 text-yellow-600 group-hover:text-[#E6A85C] transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Points Issued</p>
              <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{metrics.totalPointsIssued.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">All points given to customers</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-[#E6A85C]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center group-hover:from-[#E85A9B]/20 group-hover:to-[#D946EF]/20 transition-all duration-300">
              <Gift className="h-6 w-6 text-orange-600 group-hover:text-[#E85A9B] transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Points Redeemed</p>
              <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{metrics.totalPointsRedeemed.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Points used for rewards</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-[#E6A85C]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-[#D946EF]/20 group-hover:to-[#E6A85C]/20 transition-all duration-300">
              <Target className="h-6 w-6 text-indigo-600 group-hover:text-[#D946EF] transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reward Liability</p>
              <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatCurrency(metrics.totalRewardLiability)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Value of unused points</p>
        </div>
      </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-[#E6A85C]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-slate-100 rounded-xl flex items-center justify-center group-hover:from-[#E6A85C]/20 group-hover:to-[#E85A9B]/20 transition-all duration-300">
              <Repeat className="h-6 w-6 text-gray-600 group-hover:text-[#E6A85C] transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Point Redemption Rate</p>
              <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{metrics.pointRedemptionRate.toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Points redeemed vs issued</p>
        </div>

      {/* More Insights Toggle */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
        <button
          onClick={() => setShowMoreInsights(!showMoreInsights)}
          className="w-full flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-[#E6A85C]/5 hover:via-[#E85A9B]/5 hover:to-[#D946EF]/5 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-slate-100 rounded-lg flex items-center justify-center group-hover:from-[#E6A85C]/20 group-hover:to-[#E85A9B]/20 transition-all duration-300">
              <BarChart3 className="h-5 w-5 text-gray-600 group-hover:text-[#E6A85C] transition-colors duration-300" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 font-['Space_Grotesk'] group-hover:text-[#E6A85C] transition-colors duration-300">More Insights</h3>
              <p className="text-sm text-gray-500">Customer behavior and advanced metrics</p>
            </div>
          </div>
          {showMoreInsights ? (
            <ChevronUp className="h-5 w-5 text-gray-400 group-hover:text-[#E6A85C] transition-colors duration-300" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-[#E6A85C] transition-colors duration-300" />
          )}
        </button>

        {showMoreInsights && behaviorMetrics && (
          <div className="border-t border-gray-200 p-6 space-y-6">
            {/* Behavioral KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 hover:border-[#E6A85C]/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <Repeat className="h-5 w-5 text-blue-600 group-hover:text-[#E6A85C] transition-colors duration-300" />
                  <span className="font-medium text-gray-900 group-hover:text-[#E6A85C] transition-colors duration-300">Repeat Purchase Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatPercentage(metrics.repeatPurchaseRate)}</p>
                <p className="text-xs text-gray-500">Customers with multiple visits</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 hover:border-[#E6A85C]/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingCart className="h-5 w-5 text-green-600 group-hover:text-[#E85A9B] transition-colors duration-300" />
                  <span className="font-medium text-gray-900 group-hover:text-[#E85A9B] transition-colors duration-300">Average Order Value</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatCurrency(metrics.averageOrderValue)}</p>
                <p className="text-xs text-gray-500">Average spend per order</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 hover:border-[#E6A85C]/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="h-5 w-5 text-purple-600 group-hover:text-[#D946EF] transition-colors duration-300" />
                  <span className="font-medium text-gray-900 group-hover:text-[#D946EF] transition-colors duration-300">Loyalty AOV</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatCurrency(metrics.loyaltyAOV)}</p>
                <p className="text-xs text-gray-500">AOV for loyalty customers</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 hover:border-[#E6A85C]/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-indigo-600 group-hover:text-[#E6A85C] transition-colors duration-300" />
                  <span className="font-medium text-gray-900 group-hover:text-[#E6A85C] transition-colors duration-300">Customer Lifetime Value</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatCurrency(metrics.customerLifetimeValue)}</p>
                <p className="text-xs text-gray-500">Estimated LTV per customer</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 hover:border-[#E6A85C]/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-yellow-600 group-hover:text-[#E85A9B] transition-colors duration-300" />
                  <span className="font-medium text-gray-900 group-hover:text-[#E85A9B] transition-colors duration-300">Purchase Frequency</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{metrics.purchaseFrequency.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Orders per customer per month</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 hover:border-[#E6A85C]/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-red-600 group-hover:text-[#D946EF] transition-colors duration-300" />
                  <span className="font-medium text-gray-900 group-hover:text-[#D946EF] transition-colors duration-300">Loyalty Participation</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{formatPercentage(behaviorMetrics.loyaltyParticipation)}</p>
                <p className="text-xs text-gray-500">Customers in loyalty program</p>
              </div>
            </div>

            {/* Customer Breakdown Table */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4 font-['Space_Grotesk']">Customer Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#E6A85C] font-['Space_Grotesk']">{behaviorMetrics.newCustomers}</p>
                  <p className="text-sm text-gray-600">New Customers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#E85A9B] font-['Space_Grotesk']">{behaviorMetrics.returningCustomers}</p>
                  <p className="text-sm text-gray-600">Returning Customers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#D946EF] font-['Space_Grotesk']">{behaviorMetrics.averagePointsEarned.toFixed(0)}</p>
                  <p className="text-sm text-gray-600">Avg Points Earned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#E6A85C] font-['Space_Grotesk']">{behaviorMetrics.averagePointsRedeemed.toFixed(0)}</p>
                  <p className="text-sm text-gray-600">Avg Points Redeemed</p>
                </div>
              </div>
              
              {/* Point System Information */}
              {restaurant?.settings && (
                <div className="mt-4 p-3 bg-gradient-to-r from-[#E6A85C]/10 via-[#E85A9B]/10 to-[#D946EF]/10 rounded-lg border border-[#E6A85C]/20">
                  <h5 className="text-sm font-medium text-[#E6A85C] mb-2 font-['Space_Grotesk']">Current Point System Configuration</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-700">
                    <div>
                      <span className="font-medium">Mode:</span> {restaurant.settings.loyaltyMode === 'blanket' ? 'Blanket' : 'Menu-Based'}
                    </div>
                    <div>
                      <span className="font-medium">Point Value:</span> 1 point = {restaurant.settings.pointValueAED || 0.05} AED
                    </div>
                    <div>
                      <span className="font-medium">Earning Rate:</span> {restaurant.settings.pointsPerAED || 0.1} points per AED
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ROI Settings Modal */}
      {showROISettings && roiSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">ROI Calculation Settings</h3>
              <button
                onClick={() => setShowROISettings(false)}
                className="p-2 text-gray-400 hover:text-[#E6A85C] rounded-xl hover:bg-gradient-to-r hover:from-[#E6A85C]/10 hover:to-[#E85A9B]/10 transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#E6A85C]/10 via-[#E85A9B]/10 to-[#D946EF]/10 border border-[#E6A85C]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-[#E6A85C]" />
                  <span className="text-sm font-medium text-[#E6A85C] font-['Space_Grotesk']">About ROI Calculations</span>
                </div>
                <p className="text-xs text-gray-700">
                  These settings help estimate profitability when exact cost data isn't available. 
                  Adjust based on your restaurant's actual margins. Current point system: 1 point = {restaurant?.settings?.pointValueAED || 0.05} AED
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Profit Margin (%)
                </label>
                <input
                  type="number"
                  value={(roiSettings.default_profit_margin * 100).toFixed(0)}
                  onChange={(e) => setROISettings({
                    ...roiSettings,
                    default_profit_margin: parseFloat(e.target.value) / 100 || 0.3
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E6A85C] focus:border-transparent transition-all duration-300"
                  min="10"
                  max="80"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used when menu item cost prices aren't available
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated COGS (%)
                </label>
                <input
                  type="number"
                  value={(roiSettings.estimated_cogs_percentage * 100).toFixed(0)}
                  onChange={(e) => setROISettings({
                    ...roiSettings,
                    estimated_cogs_percentage: parseFloat(e.target.value) / 100 || 0.4
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E6A85C] focus:border-transparent transition-all duration-300"
                  min="20"
                  max="70"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cost of goods sold as percentage of revenue
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target ROI (%)
                </label>
                <input
                  type="number"
                  value={roiSettings.target_roi_percentage.toFixed(0)}
                  onChange={(e) => setROISettings({
                    ...roiSettings,
                    target_roi_percentage: parseFloat(e.target.value) || 200
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E6A85C] focus:border-transparent transition-all duration-300"
                  min="50"
                  max="500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your target return on loyalty investment
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowROISettings(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveROISettings}
                disabled={savingSettings}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-[#E6A85C] via-[#E85A9B] to-[#D946EF] text-white rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingSettings ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyROIDashboard;