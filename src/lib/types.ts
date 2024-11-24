export interface Syllabus {
  id: number;
  courseName: string;
  ipfsHashForSyllabusContent: string;
  finalized: boolean;
  lastModifiedTimestamp: number;
}

export interface Proposal {
  id: number;
  ipfsHashForProposalContent: string;
  voteCount: number;
  executed: boolean;
  count: number;
  approvedByInternalAccreditor: boolean;
}

export interface SyllabusVersion {
  id: number;
  ipfsHash: string;
  timestamp: number;
  proposalId?: number;
  type: 'initial' | 'proposal' | 'executed';
}

export type Role = 'university' | 'internalAccreditor' | 'externalAccreditor' | 'none';