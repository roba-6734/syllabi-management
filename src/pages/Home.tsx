import { useWallet } from '../contexts/WalletContext';
import { GraduationCap, Vote, UserPlus, CheckCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import RegisteredUniversities from '../components/RegisteredUniversities';

export default function Home() {
  const { role } = useWallet();

  if (role === 'internalAccreditor') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Internal Accreditor Dashboard</h1>
          <p className="text-lg opacity-90">
            Manage universities and review syllabus proposals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* University Registration */}
          <Link 
            to="/university-registration"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Register Universities</h2>
                <p className="text-gray-600">
                  Add new universities to the consortium
                </p>
              </div>
            </div>
          </Link>

          {/* Proposal Review */}
          <Link 
            to="/proposals"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Vote className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Review Proposals</h2>
                <p className="text-gray-600">
                  Review and approve syllabus change proposals for voting
                </p>
              </div>
            </div>
          </Link>

          {/* View Syllabi */}
          <Link 
            to="/syllabi"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <GraduationCap className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">View All Syllabi</h2>
                <p className="text-gray-600">
                  Monitor all syllabi in the system
                </p>
              </div>
            </div>
          </Link>

          {/* View Universities */}
          <Link 
            to="/universities"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Registered Universities</h2>
                <p className="text-gray-600">
                  View and manage consortium members
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Registered Universities List */}
        <div className="mt-8">
          <RegisteredUniversities />
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Accreditor Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Approve proposals for voting</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Register new universities</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to Syllabus Consortium</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Role: {role}</h2>
        <p className="text-gray-600">
          This platform enables universities and accreditors to collaborate on course syllabi creation and management.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Universities</h3>
          <p className="text-gray-600">Create and propose changes to course syllabi</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <Vote className="w-12 h-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Proposals</h3>
          <p className="text-gray-600">Vote on syllabus change proposals</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Accreditation</h3>
          <p className="text-gray-600">Ensure quality and standards</p>
        </div>
      </div>
    </div>
  );
}