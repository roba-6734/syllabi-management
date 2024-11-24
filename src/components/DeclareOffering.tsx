import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { School } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeclareOfferingProps {
  syllabusId: number;
  onDeclarationSubmitted: () => void;
}

export default function DeclareOffering({ syllabusId, onDeclarationSubmitted }: DeclareOfferingProps) {
  const { contract, address, role } = useWallet();
  const [isOffering, setIsOffering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkIfOffering();
  }, [syllabusId, address, contract]);

  async function checkIfOffering() {
    try {
      if (!contract || !address) return;
      const result = await contract.isUniversityAlreadyOfferingCourse(address, syllabusId);
      setIsOffering(result);
    } catch (error) {
      console.error('Error checking course offering status:', error);
    } finally {
      setChecking(false);
    }
  }

  async function handleDeclareOffering() {
    try {
      setLoading(true);
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.declareCourseOffering(syllabusId);
      await tx.wait();
      
      toast.success('Successfully declared course offering');
      setIsOffering(true);
      onDeclarationSubmitted();
    } catch (error) {
      console.error('Error declaring course offering:', error);
      toast.error('Failed to declare course offering');
    } finally {
      setLoading(false);
    }
  }

  if (role !== 'university' || checking) {
    return null;
  }

  if (isOffering) {
    return (
      <span className="flex items-center text-green-600 text-sm">
        <School className="w-4 h-4 mr-1" />
        Offering
      </span>
    );
  }

  return (
    <button
      onClick={handleDeclareOffering}
      disabled={loading}
      className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <>
          <School className="w-4 h-4 mr-1" />
          Declare Offering
        </>
      )}
    </button>
  );
}