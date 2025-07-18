import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Crown, Zap, Star, Calendar, TrendingUp } from 'lucide-react';
import { usageService, UsageStats } from '../../services/usage';

const PlanUsage: React.FC = () => {
  const { user } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    // Load usage statistics
    const stats = usageService.getUsageStats();
    setUsageStats(stats);
  }, []);

  const usagePercentage = usageStats ? (usageStats.monthlyConversions / usageStats.planLimit) * 100 : 0;
  const remainingDays = user?.trialEndDate ? 
    Math.max(0, Math.ceil((user.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  const planFeatures = {
    basic: [
      '50 conversions per month',
      '10MB max file size',
      'Basic file formats',
      'Email support',
      '30-day file retention'
    ],
    premium: [
      '500 conversions per month',
      '50MB max file size',
      'All file formats',
      'Priority support',
      'API access',
      'Bulk conversions'
    ],
    unlimited: [
      'Unlimited conversions',
      '100MB max file size',
      'All formats + video/audio',
      'Premium support',
      'Advanced API',
      'Custom integrations'
    ]
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Star className="w-6 h-6 text-gray-600" />;
      case 'premium':
        return <Zap className="w-6 h-6 text-blue-600" />;
      case 'unlimited':
        return <Crown className="w-6 h-6 text-purple-600" />;
      default:
        return <Star className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'from-gray-600 to-gray-800';
      case 'premium':
        return 'from-blue-600 to-purple-600';
      case 'unlimited':
        return 'from-purple-600 to-pink-600';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getPlanIcon(user?.plan || 'basic')}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1)} Plan
              </h3>
              <p className="text-gray-600">
                {user?.subscriptionStatus === 'trial' ? 'Free Trial' : 'Active Subscription'}
              </p>
            </div>
          </div>
          <Link
            to="/pricing"
            className={`bg-gradient-to-r ${getPlanColor(user?.plan || 'basic')} text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity`}
          >
            Upgrade Plan
          </Link>
        </div>

        {/* Trial Info */}
        {user?.subscriptionStatus === 'trial' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-900">Free Trial Active</h4>
                <p className="text-sm text-yellow-700">
                  {remainingDays} days remaining in your trial period
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{usageStats?.monthlyConversions || 0}</div>
            <div className="text-sm text-gray-600">Conversions Used</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{usageStats?.planLimit || 100}</div>
            <div className="text-sm text-gray-600">Monthly Limit</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {usageStats ? Math.max(0, usageStats.planLimit - usageStats.monthlyConversions) : 100}
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Monthly Usage</span>
            <span>{usagePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                usagePercentage > 90 ? 'bg-red-500' : 
                usagePercentage > 70 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
        <div className="space-y-3">
          {planFeatures[user?.plan as keyof typeof planFeatures]?.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Usage Analytics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">PDF Conversions</span>
              <span className="font-medium text-gray-900">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">DOCX Conversions</span>
              <span className="font-medium text-gray-900">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Image Conversions</span>
              <span className="font-medium text-gray-900">1</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-medium text-green-600">100%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. File Size</span>
              <span className="font-medium text-gray-900">2.3 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Data Processed</span>
              <span className="font-medium text-gray-900">27.6 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Suggestion */}
      {user?.plan === 'basic' && usagePercentage > 80 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Consider Upgrading</h3>
          </div>
          <p className="text-gray-600 mb-4">
            You're using {usagePercentage.toFixed(1)}% of your monthly limit. 
            Upgrade to Premium for 10x more conversions and advanced features.
          </p>
          <Link
            to="/pricing"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-block"
          >
            View Upgrade Options
          </Link>
        </div>
      )}
    </div>
  );
};

export default PlanUsage;