import React, { useCallback, useState } from 'react';
import { Upload, CheckCircle, ExternalLink } from 'lucide-react';
import { uploadToPinata, getPinataUrl } from '../lib/ipfs';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete: (hash: string) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    hash: string;
  } | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Show initial progress
      setUploadProgress(20);
      
      // Upload to Pinata
      const hash = await uploadToPinata(file);
      
      // Update progress and complete
      setUploadProgress(100);
      setUploadedFile({
        name: file.name,
        hash: hash
      });
      onUploadComplete(hash);
      toast.success('File uploaded successfully to IPFS');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
      setUploadedFile(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete]);

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">Upload Syllabus Content</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {uploadProgress < 100 ? 'Uploading to IPFS...' : 'Processing...'}
              </p>
            </div>
          ) : uploadedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully uploaded to IPFS</p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-xs font-mono bg-gray-50 p-2 rounded">
                  {uploadedFile.hash.slice(0, 20)}...{uploadedFile.hash.slice(-4)}
                </p>
                <a
                  href={getPinataUrl(uploadedFile.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="View on IPFS"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  onUploadComplete('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Upload a different file
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    disabled={uploading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX or TXT up to 10MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}