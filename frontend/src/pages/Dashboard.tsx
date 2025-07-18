import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Upload, FileText, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import FileUpload from '../components/dashboard/FileUpload';
import PlanUsage from '../components/dashboard/PlanUsage';
import RecentConversions from '../components/dashboard/RecentConversions';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');

  const tabs = [
    { id: 'upload', label: 'Upload Files', icon: <Upload className="w-5 h-5" /> },
    { id: 'recent', label: 'Recent Conversions', icon: <Clock className="w-5 h-5" /> },
    { id: 'usage', label: 'Usage & Billing', icon: <FileText className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Transform your files into beautiful Markdown with just a few clicks.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{user?.monthlyUsage || 0}</p>
                <p className="text-sm text-gray-500">conversions used</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plan Limit</p>
                <p className="text-2xl font-bold text-gray-900">{user?.monthlyLimit || 0}</p>
                <p className="text-sm text-gray-500">monthly conversions</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">98.5%</p>
                <p className="text-sm text-gray-500">conversion success</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'upload' && <FileUpload />}
          {activeTab === 'recent' && <RecentConversions />}
          {activeTab === 'usage' && <PlanUsage />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;