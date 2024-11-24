import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  Users, 
  FileText, 
  Vote,
  Calendar
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { format, fromUnixTime } from 'date-fns';
import type { Syllabus, Proposal } from '../lib/types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Analytics() {
  const { contract } = useWallet();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseOfferingData, setCourseOfferingData] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadData();
  }, [contract]);

  async function loadData() {
    try {
      if (!contract) return;

      // Load universities
      const univList = await contract.getAllUniversities();
      setUniversities(univList);

      // Load syllabi and proposals
      const count = await contract.CourseSyllabusCount();
      const syllabiList: Syllabus[] = [];
      const proposalsList: Proposal[] = [];
      const offeringData: {[key: string]: number} = {};
      
      for (let i = 1; i <= count; i++) {
        const [syllabus, proposal, offeringUnivs] = await Promise.all([
          contract.syllabi(i),
          contract.proposals(i),
          contract.getUniversitiesOfferingCourse(i)
        ]);

        if (syllabus.id.toString() !== '0') {
          syllabiList.push({
            id: Number(syllabus.id),
            courseName: syllabus.courseName,
            ipfsHashForSyllabusContent: syllabus.ipfsHashForSyllabusContent,
            finalized: syllabus.finalized,
            lastModifiedTimestamp: Number(syllabus.lastModifiedTimestamp)
          });

          offeringData[syllabus.courseName] = offeringUnivs.length;
        }

        if (proposal.id.toString() !== '0') {
          proposalsList.push({
            id: Number(proposal.id),
            ipfsHashForProposalContent: proposal.ipfsHashForProposalContent,
            voteCount: Number(proposal.voteCount),
            executed: proposal.executed,
            count: Number(proposal.count),
            approvedByInternalAccreditor: proposal.approvedByInternalAccreditor
          });
        }
      }
      
      setSyllabi(syllabiList);
      setProposals(proposalsList);
      setCourseOfferingData(offeringData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  }

  const courseOfferingChartData = {
    labels: Object.keys(courseOfferingData),
    datasets: [
      {
        label: 'Number of Universities Offering',
        data: Object.values(courseOfferingData),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const proposalStatusData = {
    labels: ['Approved', 'Pending', 'Executed'],
    datasets: [
      {
        data: [
          proposals.filter(p => p.approvedByInternalAccreditor && !p.executed).length,
          proposals.filter(p => !p.approvedByInternalAccreditor).length,
          proposals.filter(p => p.executed).length,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(59, 130, 246, 0.5)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <BarChartIcon className="w-8 h-8 mr-2" />
        Course Analytics Dashboard
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Universities</p>
              <p className="text-2xl font-bold">{universities.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Syllabi</p>
              <p className="text-2xl font-bold">{syllabi.length}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Proposals</p>
              <p className="text-2xl font-bold">{proposals.length}</p>
            </div>
            <Vote className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Executed Proposals</p>
              <p className="text-2xl font-bold">
                {proposals.filter(p => p.executed).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Offerings Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course Adoption Rate</h2>
          <Bar
            data={courseOfferingChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>

        {/* Proposal Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Proposal Status Distribution</h2>
          <Pie
            data={proposalStatusData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {syllabi
            .sort((a, b) => b.lastModifiedTimestamp - a.lastModifiedTimestamp)
            .slice(0, 5)
            .map((syllabus) => (
              <div key={syllabus.id} className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">{syllabus.courseName}</p>
                  <p className="text-sm text-gray-600">
                    Last modified: {format(fromUnixTime(syllabus.lastModifiedTimestamp), 'PPp')}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}