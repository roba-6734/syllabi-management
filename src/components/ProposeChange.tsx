import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { FileEdit, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import FileUpload from './FileUpload';

interface ProposeChangeProps {
  syllabusId: number;
  onProposalSubmitted: () => void;
}

export default function ProposeChange({ syllabusId, onProposalSubmitted }: ProposeChangeProps) {
  const { contract, role, address } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [contentHash, setContentHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOffering, setIsOffering] = useState(false);
  const [canPropose, setCanPropose] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [offeringCount, setOfferingCount] = useState(0);
  const [totalUniversities, setTotalUniversities] = useState(0);

  useEffect(() => {
    checkEligibility();
  }, [syllabusId, contract, address]);

  async function checkEligibility() {
    try {
      if (!contract || !address) return;

      // First check if the university is offering the course
      const offering = await contract.isUniversityAlreadyOfferingCourse(address, syllabusId);
      setIsOffering(offering);

      // Get all universities and universities offering the course
      const [allUniversities, offeringUniversities] = await Promise.all([
        contract.getAllUniversities(),
        contract.getUniversitiesOfferingCourse(syllabusId)
      ]);

      setTotalUniversities(allUniversities.length);
      setOfferingCount(offeringUniversities.length);

      // Check if enough universities are offering (more than half)
      const hasEnoughOfferings = offeringUniversities.length > allUniversities.length / 2;
      setCanPropose(offering && hasEnoughOfferings);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      toast.error('Error checking eligibility status');
    } finally {
      setCheckingEligibility(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role !== 'university') {
      toast.error('Only universities can propose changes');
      return;
    }

    if (!isOffering) {
      toast.error('You must declare offering this course before proposing changes');
      return;
    }

    if (!canPropose) {
      toast.error('Not enough universities are offering this course to propose changes');
      return;
    }

    if (!contentHash) {
      toast.error('Please upload a file with your proposed changes');
      return;
    }

    try {
      setLoading(true);
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.proposeSyllabusChange(syllabusId, contentHash);
      await tx.wait();
      
      toast.success('Change proposal submitted successfully');
      setIsOpen(false);
      setContentHash('');
      onProposalSubmitted();
    } catch (error) {
      console.error('Error proposing change:', error);
      toast.error('Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  }

  if (role !== 'university' || checkingEligibility) {
    return null;
  }

  const getStatusMessage = () => {
    if (!isOffering) return 'You must declare offering this course first';
    if (!canPropose) {
      return `${offeringCount} of ${totalUniversities} universities are offering this course. More than half (${Math.floor(totalUniversities / 2) + 1}) must offer the course to propose changes.`;
    }
    return 'Propose a change to this syllabus';
  };

  return (
    <div>
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={!canPropose}
          className={`flex items-center px-3 py-1 text-sm rounded ${
            canPropose
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          <FileEdit className="w-4 h-4 mr-1" />
          Propose Change
        </button>
        
        {(!isOffering || !canPropose) && (
          <div className="absolute left-0 mt-2 w-64 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
            <div className="flex items-center">
              <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
              <span>{getStatusMessage()}</span>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Propose Syllabus Change</h3>
            
            <form onSubmit={handleSubmit}>
              <FileUpload onUploadComplete={setContentHash} />

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !contentHash}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Submit Proposal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}