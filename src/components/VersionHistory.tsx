import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Clock, ArrowLeft, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react';
import { format, fromUnixTime } from 'date-fns';
import toast from 'react-hot-toast';
import type { SyllabusVersion } from '../lib/types';
import { getPinataUrl } from '../lib/ipfs';

interface VersionHistoryProps {
  syllabusId: number;
  currentHash: string;
  onClose: () => void;
}

export default function VersionHistory({ syllabusId, currentHash, onClose }: VersionHistoryProps) {
  const { contract } = useWallet();
  const [versions, setVersions] = useState<SyllabusVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    loadVersionHistory();
  }, [syllabusId, contract]);

  async function loadVersionHistory() {
    try {
      if (!contract) return;

      const versionsList: SyllabusVersion[] = [];
      
      // Get initial version from syllabus
      const syllabus = await contract.syllabi(syllabusId);
      versionsList.push({
        id: 0,
        ipfsHash: syllabus.ipfsHashForSyllabusContent,
        timestamp: Number(syllabus.lastModifiedTimestamp),
        type: 'initial'
      });

      // Get all proposals for this syllabus
      const proposal = await contract.proposals(syllabusId);
      if (proposal.id.toString() !== '0') {
        versionsList.push({
          id: Number(proposal.id),
          ipfsHash: proposal.ipfsHashForProposalContent,
          timestamp: Date.now() / 1000,
          proposalId: Number(proposal.id),
          type: proposal.executed ? 'executed' : 'proposal'
        });
      }

      // Sort by timestamp, most recent first
      setVersions(versionsList.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading version history:', error);
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  }

  async function handleRevert(version: SyllabusVersion) {
    try {
      if (!contract) return;

      const confirmRevert = window.confirm(
        'Are you sure you want to revert to this version? This will create a new proposal.'
      );

      if (!confirmRevert) return;

      const tx = await contract.proposeSyllabusChange(syllabusId, version.ipfsHash);
      await tx.wait();

      toast.success('Revert proposal created successfully');
      loadVersionHistory();
    } catch (error) {
      console.error('Error reverting version:', error);
      toast.error('Failed to create revert proposal');
    }
  }

  function getVersionLabel(version: SyllabusVersion) {
    switch (version.type) {
      case 'initial':
        return 'Initial Version';
      case 'proposal':
        return `Proposal #${version.proposalId}`;
      case 'executed':
        return `Executed Proposal #${version.proposalId}`;
      default:
        return 'Unknown Version';
    }
  }

  function getVersionBadgeColor(version: SyllabusVersion) {
    switch (version.type) {
      case 'initial':
        return 'bg-blue-100 text-blue-800';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'executed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Version History
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {comparing ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Current Version */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Current Version</h3>
                <iframe
                  src={getPinataUrl(currentHash)}
                  className="w-full h-[500px] border rounded"
                  title="Current Version"
                />
              </div>

              {/* Selected Version */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  {selectedVersion !== null && 
                    getVersionLabel(versions[selectedVersion])}
                </h3>
                <iframe
                  src={getPinataUrl(versions[selectedVersion!]?.ipfsHash)}
                  className="w-full h-[500px] border rounded"
                  title="Selected Version"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div
                  key={`${version.type}-${version.id}`}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVersionBadgeColor(version)}`}>
                        {getVersionLabel(version)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {format(fromUnixTime(version.timestamp), 'PPp')}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {version.ipfsHash.slice(0, 20)}...{version.ipfsHash.slice(-4)}
                      </code>
                      <a
                        href={getPinataUrl(version.ipfsHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedVersion(index);
                        setComparing(true);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    {version.type !== 'initial' && (
                      <button
                        onClick={() => handleRevert(version)}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {comparing && (
          <div className="p-4 border-t">
            <button
              onClick={() => {
                setComparing(false);
                setSelectedVersion(null);
              }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Back to Version List
            </button>
          </div>
        )}
      </div>
    </div>
  );
}