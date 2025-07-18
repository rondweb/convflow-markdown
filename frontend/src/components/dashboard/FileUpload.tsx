import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { apiService, ApiError } from '../../services/api';
import { usageService } from '../../services/usage';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'converting' | 'completed' | 'error';
  downloadUrl?: string;
  markdownContent?: string;
  error?: string;
}

const FileUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [supportedFormats, setSupportedFormats] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Load supported formats on component mount
  useEffect(() => {
    const loadSupportedFormats = async () => {
      try {
        const formats = await apiService.getSupportedFormats();
        // Convert the format object to an array of extensions
        const formatArray = Object.keys(formats).map(ext => ext.toUpperCase());
        setSupportedFormats(formatArray);
      } catch (error) {
        console.error('Failed to load supported formats:', error);
        // Fallback to default formats
        setSupportedFormats([
          'PDF', 'DOCX', 'XLSX', 'XLS', 'PPTX', 'TXT', 'HTML', 'XML', 'JSON', 'CSV', 
          'JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'TIFF', 'WAV', 'MP3', 'M4A', 'ZIP', 'PY', 'JS', 'MD'
        ]);
      }
    };

    loadSupportedFormats();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const isSupported = supportedFormats.some(format => 
        format.toLowerCase() === extension
      );
      
      if (!isSupported) {
        addToast(`${file.name} is not a supported file format`, 'error');
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit to match backend
        addToast(`${file.name} is too large. Maximum size is 5MB`, 'error');
        return false;
      }
      
      return true;
    });

    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading'
    }));

    setFiles(prev => [...prev, ...uploadedFiles]);
    
    // Process files with real API calls
    uploadedFiles.forEach(uploadedFile => {
      convertFile(uploadedFile);
    });
  };

  const convertFile = async (uploadedFile: UploadedFile) => {
    try {
      // Update status to converting
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'converting', progress: 100 }
          : f
      ));

      // Call the real API
      const result = await apiService.convertFile(uploadedFile.file);
      
      // Update with success result
      setFiles(prev => prev.map(f => {
        if (f.id === uploadedFile.id) {
          const markdownBlob = new Blob([result.markdown], { type: 'text/markdown' });
          const downloadUrl = URL.createObjectURL(markdownBlob);
          
          // Track successful conversion
          usageService.addConversion(
            uploadedFile.file.name,
            result.file_type,
            'completed',
            uploadedFile.file.size
          );
          
          addToast(`${uploadedFile.file.name} converted successfully!`, 'success');
          return {
            ...f,
            status: 'completed',
            downloadUrl,
            markdownContent: result.markdown
          };
        }
        return f;
      }));
      
    } catch (error) {
      console.error('Conversion failed:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Conversion failed. Please try again.';
      
      setFiles(prev => prev.map(f => {
        if (f.id === uploadedFile.id) {
          // Track failed conversion
          usageService.addConversion(
            uploadedFile.file.name,
            'Unknown',
            'failed',
            uploadedFile.file.size
          );
          
          addToast(`Failed to convert ${uploadedFile.file.name}: ${errorMessage}`, 'error');
          return {
            ...f,
            status: 'error',
            error: errorMessage
          };
        }
        return f;
      }));
    }
  };

  const removeFile = (id: string) => {
    // Clean up any object URLs to prevent memory leaks
    const file = files.find(f => f.id === id);
    if (file?.downloadUrl && file.downloadUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.downloadUrl);
    }
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const downloadFile = (file: UploadedFile) => {
    if (file.downloadUrl) {
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.download = `${file.file.name.split('.')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-gray-600 mb-4">
              Upload files up to 5MB. We support all major formats.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Choose Files
            </button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.xlsx,.xls,.pptx,.txt,.html,.xml,.json,.csv,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.wav,.mp3,.m4a,.zip,.py,.js,.md"
        />
      </div>

      {/* Supported Formats */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Supported Formats</h4>
        <div className="flex flex-wrap gap-2">
          {supportedFormats.map(format => (
            <span
              key={format}
              className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border border-gray-200"
            >
              {format}
            </span>
          ))}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Upload Progress</h4>
          {files.map(file => (
            <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(file.status)}
                  <div>
                    <h5 className="font-medium text-gray-900">{file.file.name}</h5>
                    <p className="text-sm text-gray-600">{formatFileSize(file.file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === 'completed' && file.downloadUrl && (
                    <button 
                      onClick={() => downloadFile(file)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {file.status === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-600">{file.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {file.status === 'converting' && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Converting to Markdown...</span>
                </div>
              )}
              
              {file.status === 'completed' && (
                <div className="text-sm text-green-600">
                  ✓ Conversion completed successfully
                </div>
              )}
              
              {file.status === 'error' && (
                <div className="text-sm text-red-600">
                  ✗ {file.error || 'Conversion failed'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;