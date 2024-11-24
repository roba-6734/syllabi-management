import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisteredUniversities() {
  const { contract } = useWallet();
  const [universities, setUniversities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUniversities();
  }, [contract]);

  async function loadUniversities() {
    try {
      if (!contract) return;
      
      const universities: string[] = [];
      let index = 0;
      
      while (true) {
        try {
          const university = await contract.Universities(index);
          if (university === '0x0000000000000000000000000000000000000000') break;
          universities.push(university);
          index++;
        } catch (error) {
          break;
        }
      }
      
      setUniversities(universities);
    } catch (error) {
      console.error('Error loading universities:', error);
      toast.error('Failed to load universities');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Users className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold">Registered Universities</h2>
      </div>
      
      {universities.length > 0 ? (
        <div className="space-y-4">
          {universities.map((address, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-gray-600">
                    {address}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    University #{index + 1}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">
          <p>No universities registered yet</p>
        </div>
      )}
    </div>
  );
}