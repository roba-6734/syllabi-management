import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { FileText, Clock, Check, ExternalLink, Vote, CheckCircle2, History, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Syllabus } from '../lib/types';
import { getPinataUrl } from '../lib/ipfs';
import ProposeChange from '../components/ProposeChange';
import DeclareOffering from '../components/DeclareOffering';
import VersionHistory from '../components/VersionHistory';

interface SyllabusWithProposal extends Syllabus {
  hasExecutedProposal?: boolean;
}

type SortField = 'courseName' | 'lastModifiedTimestamp' | 'id';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'draft' | 'finalized' | 'executed';

export default function Syllabi() {
  const { contract } = useWallet();
  const [syllabi, setSyllabi] = useState<SyllabusWithProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSyllabi();
  }, [contract]);

  async function loadSyllabi() {
    try {
      if (!contract) return;
      const count = await contract.CourseSyllabusCount();
      const syllabiList: SyllabusWithProposal[] = [];
      
      for (let i = 1; i <= count; i++) {
        const [syllabus, proposal] = await Promise.all([
          contract.syllabi(i),
          contract.proposals(i)
        ]);

        syllabiList.push({
          id: Number(syllabus.id),
          courseName: syllabus.courseName,
          ipfsHashForSyllabusContent: syllabus.ipfsHashForSyllabusContent,
          finalized: syllabus.finalized,
          lastModifiedTimestamp: Number(syllabus.lastModifiedTimestamp),
          hasExecutedProposal: proposal.executed
        });
      }
      
      setSyllabi(syllabiList);
    } catch (error) {
      console.error('Error loading syllabi:', error);
      toast.error('Failed to load syllabi');
    } finally {
      setLoading(false);
    }
  }

  function getStatusDisplay(syllabus: SyllabusWithProposal) {
    if (syllabus.hasExecutedProposal) {
      return (
        <span className="flex items-center text-green-600" title="Changes approved and executed">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Executed
        </span>
      );
    }
    if (syllabus.finalized) {
      return (
        <span className="flex items-center text-green-600">
          <Check className="w-4 h-4 mr-1" />
          Finalized
        </span>
      );
    }
    return (
      <span className="flex items-center text-yellow-600">
        <Clock className="w-4 h-4 mr-1" />
        Draft
      </span>
    );
  }

  function getSyllabusStatus(syllabus: SyllabusWithProposal): FilterStatus {
    if (syllabus.hasExecutedProposal) return 'executed';
    if (syllabus.finalized) return 'finalized';
    return 'draft';
  }

  const filteredSyllabi = syllabi
    .filter(syllabus => {
      // Text search
      const matchesSearch = syllabus.courseName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        getSyllabusStatus(syllabus) === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'courseName':
          comparison = a.courseName.localeCompare(b.courseName);
          break;
        case 'lastModifiedTimestamp':
          comparison = a.lastModifiedTimestamp - b.lastModifiedTimestamp;
          break;
        case 'id':
          comparison = a.id - b.id;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Course Syllabi</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          <Filter className="w-4 h-4 mr-1" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Courses
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by course name..."
                  className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="w-full border rounded-md py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="finalized">Finalized</option>
                <option value="executed">Executed</option>
              </select>
            </div>

            {/* Sort Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="w-full border rounded-md py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="id">ID</option>
                <option value="courseName">Course Name</option>
                <option value="lastModifiedTimestamp">Last Modified</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <button
                onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                className="w-full flex items-center justify-center px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? (
                  <><SortAsc className="w-4 h-4 mr-2" /> Ascending</>
                ) : (
                  <><SortDesc className="w-4 h-4 mr-2" /> Descending</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {filteredSyllabi.map((syllabus) => (
          <div key={syllabus.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold">{syllabus.courseName}</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {syllabus.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <DeclareOffering 
                  syllabusId={syllabus.id}
                  onDeclarationSubmitted={loadSyllabi}
                />
                <ProposeChange 
                  syllabusId={syllabus.id} 
                  onProposalSubmitted={loadSyllabi}
                />
                <button
                  onClick={() => setSelectedSyllabus(syllabus)}
                  className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <History className="w-4 h-4 mr-1" />
                  History
                </button>
                {getStatusDisplay(syllabus)}
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Content:</h4>
              <div className="flex items-center mt-1">
                <p className="text-sm font-mono bg-gray-50 p-2 rounded flex-1">
                  {syllabus.ipfsHashForSyllabusContent}
                </p>
                <a
                  href={getPinataUrl(syllabus.ipfsHashForSyllabusContent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-2 text-blue-600 hover:text-blue-800"
                  title="View content"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Last modified: {new Date(syllabus.lastModifiedTimestamp * 1000).toLocaleString()}
            </div>
          </div>
        ))}
        {filteredSyllabi.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {syllabi.length === 0 ? 'No syllabi found' : 'No matching syllabi found'}
            </p>
          </div>
        )}
      </div>

      {selectedSyllabus && (
        <VersionHistory
          syllabusId={selectedSyllabus.id}
          currentHash={selectedSyllabus.ipfsHashForSyllabusContent}
          onClose={() => setSelectedSyllabus(null)}
        />
      )}
    </div>
  );
}