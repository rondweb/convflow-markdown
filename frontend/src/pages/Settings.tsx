import React, { useState } from 'react';
import { useKeycloakAuth } from '../contexts/KeycloakAuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Mail, Lock, CreditCard, Bell, Shield, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useKeycloakAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    conversionAlerts: true,
    billingAlerts: true,
    securityAlerts: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'password', label: 'Password', icon: <Lock className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> }
  ];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      addToast('Password must be at least 8 characters long', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast('Password updated successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      addToast('Failed to update password. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveNotifications = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast('Notification preferences updated!', 'success');
    } catch (error) {
      addToast('Failed to update preferences. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  </div>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Lock className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                  </div>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Billing & Subscription</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
                      <p className="text-2xl font-bold text-blue-600 mb-2">{user?.plan?.toUpperCase()}</p>
                      <p className="text-gray-600 mb-4">
                        {user?.subscriptionStatus === 'trial' ? 'Free Trial' : 'Active Subscription'}
                      </p>
                      <div className="flex space-x-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Upgrade Plan
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                          View Billing History
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">
                          VISA
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-600">Expires 12/25</p>
                        </div>
                        <button className="ml-auto text-blue-600 hover:text-blue-800 transition-colors">
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Bell className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Conversion Alerts</h3>
                          <p className="text-sm text-gray-600">Get notified when conversions complete</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.conversionAlerts}
                          onChange={(e) => handleNotificationChange('conversionAlerts', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Billing Alerts</h3>
                          <p className="text-sm text-gray-600">Payment and subscription updates</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.billingAlerts}
                          onChange={(e) => handleNotificationChange('billingAlerts', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Security Alerts</h3>
                          <p className="text-sm text-gray-600">Account security and login notifications</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.securityAlerts}
                          onChange={(e) => handleNotificationChange('securityAlerts', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={saveNotifications}
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{isLoading ? 'Saving...' : 'Save Preferences'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-medium text-green-900 mb-2">Account Security Status</h3>
                      <p className="text-sm text-green-700">Your account is secure and properly configured.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                          <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Enable
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                          <h3 className="font-medium text-gray-900">Active Sessions</h3>
                          <p className="text-sm text-gray-600">Manage your active login sessions</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                          View Sessions
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                          <h3 className="font-medium text-gray-900">Download Data</h3>
                          <p className="text-sm text-gray-600">Export your account data and conversion history</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                          Request Export
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <h3 className="font-medium text-red-900">Delete Account</h3>
                          <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                        </div>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;