import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import FileUpload from '../components/FileUpload';

export default function CreateSyllabus() {
  const { contract, role } = useWallet();
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role !== 'university') {
      toast.error('Only universities can create syllabi');
      return;
    }

    if (!contentHash) {
      toast.error('Please upload a syllabus file');
      return;
    }

    try {
      setLoading(true);
      if (!contract) throw new Error('Contract not initialized');

      // Create the syllabus
      const tx = await contract.createCourseSyllabus(courseName, contentHash);
      const receipt = await tx.wait();

      // Find the SyllabusCreated event to get the syllabusId
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'SyllabusCreated'
      );

      if (event) {
        const syllabusId = event.args[0];
        
        // Automatically declare offering for the created syllabus
        const declareTx = await contract.declareCourseOffering(syllabusId);
        await declareTx.wait();
      }

      toast.success('Syllabus created and offering declared successfully');
      navigate('/syllabi');
    } catch (error) {
      console.error('Error creating syllabus:', error);
      toast.error('Failed to create syllabus');
    } finally {
      setLoading(false);
    }
  }

  if (role !== 'university') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
        <p className="text-gray-600">
          Only universities can create syllabi.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Syllabus</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
              Course Name
            </label>
            <input
              type="text"
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <FileUpload onUploadComplete={setContentHash} />

          <button
            type="submit"
            disabled={loading || !contentHash}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Create Syllabus'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}