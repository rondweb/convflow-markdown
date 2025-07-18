import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Calendar, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { usageService, ConversionRecord } from '../../services/usage';

interface Conversion {
  id: string;
  filename: string;
  originalFormat: string;
  status: 'completed' | 'failed' | 'processing';
  createdAt: Date;
  fileSize: number;
  downloadUrl?: string;
}

const RecentConversions: React.FC = () => {
  const [recentConversions, setRecentConversions] = useState<ConversionRecord[]>([]);

  useEffect(() => {
    // Load recent conversions from local storage
    const conversions = usageService.getRecentConversions();
    setRecentConversions(conversions);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Conversions</h3>
        <Link
          to="/history"
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Conversions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {recentConversions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No conversions yet</h4>
            <p className="text-gray-600 mb-6">
              Upload your first file to start converting to Markdown
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
              Upload File
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentConversions.map((conversion, index) => (
              <div key={conversion.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{conversion.filename}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {conversion.originalFormat}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatFileSize(conversion.fileSize)}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(conversion.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(conversion.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(conversion.status)}`}>
                        {conversion.status.charAt(0).toUpperCase() + conversion.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {getTimeAgo(conversion.createdAt)}
                    </div>
                    
                    {conversion.status === 'completed' && conversion.downloadUrl && (
                      <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    )}
                    
                    {conversion.status === 'processing' && (
                      <div className="flex items-center space-x-2 text-yellow-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                        <span className="text-sm">Processing...</span>
                      </div>
                    )}
                    
                    {conversion.status === 'failed' && (
                      <button className="text-red-600 hover:text-red-800 transition-colors text-sm">
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversions</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">91.7%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Processed</p>
              <p className="text-2xl font-bold text-purple-600">31.2 MB</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentConversions;