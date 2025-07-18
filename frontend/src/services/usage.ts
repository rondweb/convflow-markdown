// Local storage service for tracking conversions
export interface ConversionRecord {
  id: string;
  filename: string;
  fileType: string;
  timestamp: Date;
  status: 'completed' | 'failed';
  fileSize: number;
}

export interface UsageStats {
  totalConversions: number;
  monthlyConversions: number;
  dailyConversions: number;
  storageUsed: number;
  planLimit: number;
}

class UsageService {
  private storageKey = 'convflow_conversions';
  private maxRecords = 1000; // Keep last 1000 conversions

  // Add a new conversion record
  addConversion(filename: string, fileType: string, status: 'completed' | 'failed', fileSize: number): void {
    const records = this.getConversions();
    const newRecord: ConversionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      filename,
      fileType,
      timestamp: new Date(),
      status,
      fileSize
    };

    records.unshift(newRecord); // Add to beginning
    
    // Keep only the most recent records
    if (records.length > this.maxRecords) {
      records.splice(this.maxRecords);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  // Get all conversion records
  getConversions(): ConversionRecord[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const records = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return records.map((record: any) => ({
        ...record,
        timestamp: new Date(record.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load conversion records:', error);
      return [];
    }
  }

  // Get recent conversions (last 10)
  getRecentConversions(): ConversionRecord[] {
    return this.getConversions().slice(0, 10);
  }

  // Get usage statistics
  getUsageStats(): UsageStats {
    const records = this.getConversions();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalConversions = records.filter(r => r.status === 'completed').length;
    const monthlyConversions = records.filter(r => 
      r.status === 'completed' && r.timestamp >= startOfMonth
    ).length;
    const dailyConversions = records.filter(r => 
      r.status === 'completed' && r.timestamp >= startOfDay
    ).length;

    // Calculate storage used (sum of file sizes for completed conversions this month)
    const storageUsed = records
      .filter(r => r.status === 'completed' && r.timestamp >= startOfMonth)
      .reduce((total, r) => total + r.fileSize, 0);

    return {
      totalConversions,
      monthlyConversions,
      dailyConversions,
      storageUsed: Math.round(storageUsed / (1024 * 1024)), // Convert to MB
      planLimit: 100 // Default plan limit of 100 conversions per month
    };
  }

  // Clear all records (for testing)
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const usageService = new UsageService();
export default usageService;
