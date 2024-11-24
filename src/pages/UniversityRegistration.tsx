import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { GraduationCap, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UniversityRegistration() {
  const { contract, role } = useWallet();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role !== 'internalAccreditor') {
      toast.error('Only internal accreditor can register universities');
      return;
    }

    try {
      setLoading(true);
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.registerNewUniversity(address);
      await tx.wait();
      
      toast.success('University registered successfully');
      setAddress('');
    } catch (error) {
      console.error('Error registering university:', error);
      toast.error('Failed to register university');
    } finally {
      setLoading(false);
    }
  }

  if (role !== 'internalAccreditor') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
        <p className="text-gray-600">
          Only the internal accreditor can register new universities.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Register New University</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              University Wallet Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              pattern="^0x[a-fA-F0-9]{40}$"
              title="Please enter a valid Ethereum address"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Register University
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}