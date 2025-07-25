import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  User, Mail, Phone, Calendar, ArrowRight, ArrowLeft, 
  CheckCircle, Search, UserPlus, Sparkles, Gift, Star,
  Trophy, Heart, Zap, Eye, EyeOff, Lock,
  Shield, MessageSquare, Loader2, Crown, Award, ChefHat,
  Home, History, CreditCard, QrCode, X, Menu, Bell,
  TrendingUp, Wallet, Copy, Check, Share2, MoreVertical
} from 'lucide-react';
import { CustomerService } from '../services/customerService';
import { RewardService } from '../services/rewardService';
import CustomerOnboarding from './CustomerOnboarding';
import CustomerRedemptionModal from './CustomerRedemptionModal';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  settings: any;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  total_points: number;
  lifetime_points: number;
  current_tier: 'bronze' | 'silver' | 'gold';
  tier_progress: number;
  visit_count: number;
  total_spent: number;
  last_visit?: string;
  created_at: string;
}

interface Reward {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  category: string;
  min_tier: 'bronze' | 'silver' | 'gold';
  is_active: boolean;
  total_available?: number;
  total_redeemed: number;
}

interface CustomerWalletProps {
  restaurantSlug?: string;
  isDemo?: boolean;
  onClose?: () => void;
}

const CustomerWallet: React.FC<CustomerWalletProps> = ({ 
  restaurantSlug, 
  isDemo = false, 
  onClose 
}) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'rewards' | 'history' | 'profile'>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState('');

  // Animation refs
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDemo) {
      // Demo mode - use mock data
      setRestaurant({
        id: 'demo-restaurant',
        name: 'Demo Restaurant',
        slug: 'demo',
        settings: {}
      });
      setCustomer({
        id: 'demo-customer',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        total_points: 250,
        lifetime_points: 450,
        current_tier: 'silver',
        tier_progress: 75,
        visit_count: 8,
        total_spent: 320,
        created_at: new Date().toISOString()
      });
      setRewards([
        {
          id: '1',
          name: 'Free Appetizer',
          description: 'Choose any appetizer from our menu',
          points_required: 100,
          category: 'food',
          min_tier: 'bronze',
          is_active: true,
          total_redeemed: 0
        },
        {
          id: '2',
          name: 'Free Dessert',
          description: 'Complimentary dessert of your choice',
          points_required: 150,
          category: 'food',
          min_tier: 'bronze',
          is_active: true,
          total_redeemed: 0
        }
      ]);
      setLoading(false);
    } else {
      fetchRestaurantData();
    }
  }, [restaurantSlug, isDemo]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      // Implementation for real restaurant data fetching
      // This would be implemented based on your existing backend
    } catch (err: any) {
      setError(err.message || 'Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (customerData: Customer) => {
    setCustomer(customerData);
    setShowOnboarding(false);
    
    if (customerData && restaurant) {
      // Fetch customer's available rewards
      try {
        const availableRewards = await RewardService.getAvailableRewards(restaurant.id, customerData.id);
        setRewards(availableRewards);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      }
    }
  };

  const handleRewardRedeem = async (reward: Reward) => {
    setSelectedReward(reward);
    setShowRedemptionModal(true);
  };

  const handleRedemptionConfirm = async () => {
    if (!selectedReward || !customer || !restaurant) return;
    
    try {
      await RewardService.redeemReward(restaurant.id, customer.id, selectedReward.id);
      
      // Update customer points
      const updatedCustomer = await CustomerService.getCustomer(restaurant.id, customer.id);
      if (updatedCustomer) {
        setCustomer(updatedCustomer);
      }
      
      // Refresh rewards
      const availableRewards = await RewardService.getAvailableRewards(restaurant.id, customer.id);
      setRewards(availableRewards);
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to redeem reward');
    }
  };

  const generateQRCode = () => {
    if (!customer || !restaurant) return;
    
    const qrData = JSON.stringify({
      customerId: customer.id,
      restaurantId: restaurant.id,
      timestamp: Date.now()
    });
    
    setQRCodeData(qrData);
    setShowQRCode(true);
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'gold':
        return { 
          name: 'Gold', 
          icon: Crown, 
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          gradientFrom: 'from-yellow-400',
          gradientTo: 'to-yellow-600'
        };
      case 'silver':
        return { 
          name: 'Silver', 
          icon: Award, 
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          gradientFrom: 'from-gray-400',
          gradientTo: 'to-gray-600'
        };
      default:
        return { 
          name: 'Bronze', 
          icon: ChefHat, 
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          gradientFrom: 'from-orange-400',
          gradientTo: 'to-orange-600'
        };
    }
  };

  const getNextTierInfo = (currentTier: string) => {
    switch (currentTier) {
      case 'bronze': return { name: 'Silver', pointsNeeded: 500 };
      case 'silver': return { name: 'Gold', pointsNeeded: 1000 };
      case 'gold': return { name: 'Platinum', pointsNeeded: 2000 };
      default: return null;
    }
  };

  // Show onboarding if no customer
  if (!customer && !loading) {
    return (
      <CustomerOnboarding
        restaurant={restaurant!}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1E2A78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#1E2A78] text-white rounded-lg hover:bg-[#3B4B9A] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(customer.current_tier);
  const nextTier = getNextTierInfo(customer.current_tier);
  const TierIcon = tierInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1E2A78] to-[#3B4B9A] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'Orbitron, monospace' }}>V</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900" style={{ fontFamily: 'Orbitron, monospace' }}>VOYA</h1>
              <p className="text-xs text-gray-500">Loyalty Program</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={generateQRCode}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <QrCode className="h-5 w-5" />
            </button>
            {isDemo && onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="pb-20">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="p-4 space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1E2A78] to-[#3B4B9A] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {customer.first_name[0]}{customer.last_name[0]}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {customer.first_name} {customer.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <TierIcon className={`h-4 w-4 ${tierInfo.color}`} />
                    <span className="text-sm font-medium text-gray-600">{tierInfo.name} Member</span>
                  </div>
                </div>
              </div>

              {/* Tier Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tier Progress</span>
                  {nextTier && (
                    <span className="text-xs text-gray-500">
                      {customer.lifetime_points} / {nextTier.pointsNeeded} to {nextTier.name}
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${tierInfo.gradientFrom} ${tierInfo.gradientTo}`}
                    style={{ 
                      width: nextTier 
                        ? `${Math.min((customer.lifetime_points / nextTier.pointsNeeded) * 100, 100)}%`
                        : '100%'
                    }}
                  />
                </div>
              </div>

              {/* Points Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Available Points</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{customer.total_points}</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Total Spent</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{customer.total_spent} AED</p>
                </div>
              </div>

              {/* QR Code Button */}
              <button
                onClick={generateQRCode}
                className="w-full mt-4 bg-gradient-to-r from-[#1E2A78] to-[#3B4B9A] text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <QrCode className="h-5 w-5" />
                Show QR to Earn Points
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lifetime Points</p>
                    <p className="text-xl font-bold text-gray-900">{customer.lifetime_points}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Visits</p>
                    <p className="text-xl font-bold text-gray-900">{customer.visit_count}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Rewards Preview */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Available Rewards</h3>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className="text-[#1E2A78] hover:text-[#3B4B9A] font-medium text-sm"
                >
                  View All
                </button>
              </div>
              
              {rewards.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No rewards available</p>
                  <p className="text-sm text-gray-400">Keep earning points to unlock rewards!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rewards.slice(0, 2).map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{reward.name}</h4>
                        <p className="text-sm text-gray-600">{reward.points_required} points</p>
                      </div>
                      <button
                        onClick={() => handleRewardRedeem(reward)}
                        disabled={customer.total_points < reward.points_required}
                        className="px-4 py-2 bg-[#1E2A78] text-white rounded-lg hover:bg-[#3B4B9A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Available Rewards</h2>
            
            {rewards.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
                <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rewards Available</h3>
                <p className="text-gray-500">Keep earning points to unlock amazing rewards!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{reward.name}</h3>
                        {reward.description && (
                          <p className="text-gray-600 text-sm mb-3">{reward.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1E2A78]">
                            {reward.points_required} points
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {reward.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRewardRedeem(reward)}
                      disabled={customer.total_points < reward.points_required}
                      className="w-full bg-gradient-to-r from-[#1E2A78] to-[#3B4B9A] text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {customer.total_points >= reward.points_required ? 'Redeem Now' : 'Not Enough Points'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            
            <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
              <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
              <p className="text-gray-500">Your transaction history will appear here</p>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Profile</h2>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1E2A78] to-[#3B4B9A] rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {customer.first_name[0]}{customer.last_name[0]}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {customer.first_name} {customer.last_name}
                </h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <TierIcon className={`h-5 w-5 ${tierInfo.color}`} />
                  <span className="font-medium text-gray-600">{tierInfo.name} Member</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{customer.email}</span>
                </div>
                
                {customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium text-gray-900">{customer.phone}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Visits</span>
                  <span className="font-medium text-gray-900">{customer.visit_count}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'rewards', label: 'Rewards', icon: Gift },
            { id: 'history', label: 'History', icon: History },
            { id: 'profile', label: 'Profile', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#1E2A78] bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Your QR Code</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center border-2 border-gray-200">
                <QrCode className="h-24 w-24 text-gray-400" />
              </div>
              
              <p className="text-gray-600 mb-4">
                Show this QR code to staff to earn points with your purchase
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer ID</span>
                  <code className="text-sm font-mono text-gray-900">{customer.id.slice(-8)}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redemption Modal */}
      {showRedemptionModal && selectedReward && customer && restaurant && (
        <CustomerRedemptionModal
          reward={selectedReward}
          customer={customer}
          restaurant={restaurant}
          onConfirm={handleRedemptionConfirm}
          onClose={() => {
            setShowRedemptionModal(false);
            setSelectedReward(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerWallet;