import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

const FileUpload = ({ onUpload, accept, multiple = false, maxSize = 5 }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    const newErrors = [];

    newFiles.forEach(file => {
      if (file.size > maxSize * 1024 * 1024) {
        newErrors.push(`${file.name} exceeds ${maxSize}MB limit`);
      }
    });

    setErrors(newErrors);

    if (newErrors.length === 0) {
      setFiles(prev => [...prev, ...newFiles]);
      onUpload && onUpload(multiple ? [...files, ...newFiles] : newFiles[0]);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const getFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <div className={`p-4 rounded-full ${dragActive ? 'bg-blue-500' : 'bg-gray-800'}`}>
            <Upload size={32} className="text-gray-400" />
          </div>
          <div>
            <p className="text-gray-300 font-medium">
              {dragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-gray-500 text-sm mt-1">or click to browse</p>
          </div>
          <p className="text-gray-500 text-xs">
            Max file size: {maxSize}MB
          </p>
        </label>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700"
            >
              <CheckCircle size={18} className="text-green-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{getFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
