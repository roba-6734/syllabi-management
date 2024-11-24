import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import toast from 'react-hot-toast';
import type { Syllabus } from '../lib/types';

export default function SyllabusManager() {
  const { contract, role } = useWallet();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [courseName, setCourseName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSyllabi();
  }, [contract]);

  async function loadSyllabi() {
    try {
      if (!contract) return;
      const count = await contract.CourseSyllabusCount();
      const syllabiList: Syllabus[] = [];
      
      for (let i = 1; i <= count; i++) {
        const syllabus = await contract.syllabi(i);
        syllabiList.push({
          id: syllabus.id,
          courseName: syllabus.courseName,
          ipfsHashForSyllabusContent: syllabus.ipfsHashForSyllabusContent,
          finalized: syllabus.finalized,
          lastModifiedTimestamp: Number(syllabus.lastModifiedTimestamp)
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

  async function createSyllabus(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!contract) return;
      const tx = await contract.createCourseSyllabus(courseName, content);
      await tx.wait();
      toast.success('Syllabus created successfully');
      loadSyllabi();
      setCourseName('');
      setContent('');
    } catch (error) {
      console.error('Error creating syllabus:', error);
      toast.error('Failed to create syllabus');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {(role === 'university' || role === 'internalAccreditor') && (
        <form onSubmit={createSyllabus} className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Syllabus</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content Hash</label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Create Syllabus
            </button>
          </div>
        </form>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Existing Syllabi</h2>
        <div className="space-y-4">
          {syllabi.map((syllabus) => (
            <div key={syllabus.id} className="border p-4 rounded-md">
              <h3 className="font-medium">{syllabus.courseName}</h3>
              <p className="text-sm text-gray-600">Content Hash: {syllabus.ipfsHashForSyllabusContent}</p>
              <p className="text-sm text-gray-600">
                Status: {syllabus.finalized ? 'Finalized' : 'Draft'}
              </p>
            </div>
          ))}
          {syllabi.length === 0 && (
            <p className="text-gray-600">No syllabi found</p>
          )}
        </div>
      </div>
    </div>
  );
}