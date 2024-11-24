import toast from 'react-hot-toast';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export async function uploadToPinata(file: File): Promise<string> {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload file');
  }
}

export function getPinataUrl(hash: string): string {
  if (!hash) return '';
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}