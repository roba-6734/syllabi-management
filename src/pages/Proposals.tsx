import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Vote, CheckCircle, XCircle, Play, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Proposal } from '../lib/types';

export default function Proposals() {
  const { contract, role, address } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUniversities, setTotalUniversities] = useState(0);
  const [offeringStatus, setOfferingStatus] = useState<Record<number, boolean>>({});
  const [votedStatus, setVotedStatus] = useState<Record<number, boolean>>({});
  const [voteCount, setVoteCount] = useState<Record<number, number>>({});

  useEffect(() => {
    loadProposals();
  }, [contract]);

  async function loadProposals() {
    try {
      if (!contract || !address) return;
      const count = await contract.CourseSyllabusCount();
      const proposalsList: Proposal[] = [];
      const offeringMap: Record<number, boolean> = {};
      const votedMap: Record<number, boolean> = {};
      const voteCountMap: Record<number, number> = {};
      
      // Get total universities using the new helper function
      const universities = await contract.getAllUniversities();
      setTotalUniversities(universities.length);
      
      for (let i = 1; i <= count; i++) {
        const proposal = await contract.proposals(i);
        if (proposal.id.toString() !== '0') {
          proposalsList.push({
            id: Number(proposal.id),
            ipfsHashForProposalContent: proposal.ipfsHashForProposalContent,
            voteCount: Number(proposal.voteCount),
            executed: proposal.executed,
            count: Number(proposal.count),
            approvedByInternalAccreditor: proposal.approvedByInternalAccreditor
          });

          voteCountMap[i] = Number(proposal.voteCount);

          if (role === 'university') {
            const isOffering = await contract.isUniversityAlreadyOfferingCourse(address, i);
            offeringMap[i] = isOffering;
            
            const hasVoted = await contract.whoVoted(i, address);
            votedMap[i] = hasVoted;
          }
        }
      }
      
      setProposals(proposalsList);
      setOfferingStatus(offeringMap);
      setVotedStatus(votedMap);
      setVoteCount(voteCountMap);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(proposalId: number) {
    try {
      if (!contract) return;

      if (role === 'university') {
        const isOffering = await contract.isUniversityAlreadyOfferingCourse(address, proposalId);
        if (!isOffering) {
          toast.error('You must declare offering this course before voting');
          return;
        }
      }

      const tx = await contract.voteForProposal(proposalId);
      await tx.wait();
      
      // Update vote count immediately
      const updatedProposal = await contract.proposals(proposalId);
      setVoteCount(prev => ({
        ...prev,
        [proposalId]: Number(updatedProposal.voteCount)
      }));
      
      setVotedStatus(prev => ({
        ...prev,
        [proposalId]: true
      }));
      
      toast.success('Vote submitted successfully');
      loadProposals();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote');
    }
  }

  async function handleApprove(proposalId: number) {
    try {
      if (!contract) return;
      const tx = await contract.approveForVoting(proposalId);
      await tx.wait();
      toast.success('Proposal approved for voting');
      loadProposals();
    } catch (error) {
      console.error('Error approving proposal:', error);
      toast.error('Failed to approve proposal');
    }
  }

  async function handleExecute(proposalId: number) {
    try {
      if (!contract) return;
      const tx = await contract.executeProposal(proposalId);
      await tx.wait();
      toast.success('Proposal executed successfully');
      loadProposals();
    } catch (error) {
      console.error('Error executing proposal:', error);
      toast.error('Failed to execute proposal');
    }
  }

  function canExecuteProposal(proposal: Proposal): boolean {
    return (
      role === 'internalAccreditor' &&
      proposal.approvedByInternalAccreditor &&
      !proposal.executed &&
      proposal.voteCount >= (totalUniversities + 1) / 2
    );
  }

  function getProposalStatus(proposal: Proposal) {
    if (proposal.executed) {
      return (
        <span className="flex items-center text-green-600">
          <CheckSquare className="w-4 h-4 mr-1" />
          Executed
        </span>
      );
    }
    if (proposal.approvedByInternalAccreditor) {
      return (
        <span className="flex items-center text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          Approved
        </span>
      );
    }
    return (
      <span className="flex items-center text-yellow-600">
        <XCircle className="w-4 h-4 mr-1" />
        Pending Approval
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Syllabus Change Proposals</h1>
      <div className="grid gap-6">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">Proposal #{proposal.id}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Votes: {voteCount[proposal.id] || 0}
                </p>
                {role === 'university' && !offeringStatus[proposal.id] && (
                  <p className="text-sm text-yellow-600 mt-1">
                    You must declare offering this course to vote
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {getProposalStatus(proposal)}
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Content Hash:</h4>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded mt-1">
                {proposal.ipfsHashForProposalContent}
              </p>
            </div>
            <div className="mt-6 flex space-x-4">
              {role === 'university' && 
                proposal.approvedByInternalAccreditor && 
                !proposal.executed && 
                offeringStatus[proposal.id] && (
                <button
                  onClick={() => handleVote(proposal.id)}
                  disabled={votedStatus[proposal.id]}
                  className={`flex items-center px-4 py-2 rounded ${
                    votedStatus[proposal.id]
                      ? 'bg-green-200 text-green-800 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Vote className="w-4 h-4 mr-2" />
                  {votedStatus[proposal.id] ? 'Voted' : 'Vote'}
                </button>
              )}
              {role === 'internalAccreditor' && !proposal.approvedByInternalAccreditor && (
                <button
                  onClick={() => handleApprove(proposal.id)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve for Voting
                </button>
              )}
              {canExecuteProposal(proposal) && (
                <button
                  onClick={() => handleExecute(proposal.id)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Execute Proposal
                </button>
              )}
            </div>
          </div>
        ))}
        {proposals.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No proposals found</p>
          </div>
        )}
      </div>
    </div>
  );
}