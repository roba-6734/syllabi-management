import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { PieChart, Users, Vote, History } from 'lucide-react';
import toast from 'react-hot-toast';

interface CourseStatsProps {
  syllabusId: number;
  totalUniversities: number;
}

export default function CourseStats({ syllabusId, totalUniversities }: CourseStatsProps) {
  const { contract } = useWallet();
  const [stats, setStats] = useState({
    offeringCount: 0,
    proposalCount: 0,
    voteCount: 0,
    adoptionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [syllabusId, contract]);

  async function loadStats() {
    try {
      if (!contract) return;

      // Get universities offering the course
      const offeringUnivs = await contract.getUniversitiesOfferingCourse(syllabusId);
      
      // Get proposal data
      const proposal = await contract.proposals(syllabusId);
      
      setStats({
        offeringCount: offeringUnivs.length,
        proposalCount: Number(proposal.count || 0),
        voteCount: Number(proposal.voteCount || 0),
        adoptionRate: (offeringUnivs.length / totalUniversities) * 100
      });
    } catch (error) {
      console.error('Error loading course stats:', error);
      toast.error('Failed to load course statistics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-100 h-20 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <PieChart className="w-4 h-4 mr-1" />
        Course Statistics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-600">Universities Offering</p>
            <p className="text-sm font-medium">{stats.offeringCount} ({stats.adoptionRate.toFixed(1)}%)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-xs text-gray-600">Change Proposals</p>
            <p className="text-sm font-medium">{stats.proposalCount}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Vote className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-xs text-gray-600">Current Votes</p>
            <p className="text-sm font-medium">{stats.voteCount}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            stats.adoptionRate >= 75 ? 'bg-green-500' :
            stats.adoptionRate >= 50 ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <div>
            <p className="text-xs text-gray-600">Adoption Status</p>
            <p className="text-sm font-medium">
              {stats.adoptionRate >= 75 ? 'High' :
               stats.adoptionRate >= 50 ? 'Medium' :
               'Low'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}