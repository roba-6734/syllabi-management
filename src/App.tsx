import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useWallet } from './contexts/WalletContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Syllabi from './pages/Syllabi';
import Proposals from './pages/Proposals';
import CreateSyllabus from './pages/CreateSyllabus';
import UniversityRegistration from './pages/UniversityRegistration';
import Analytics from './pages/Analytics';

function App() {
  const { address } = useWallet();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {address ? (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/syllabi" element={<Syllabi />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/create-syllabus" element={<CreateSyllabus />} />
              <Route path="/university-registration" element={<UniversityRegistration />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          ) : (
            <div className="text-center mt-20">
              <h2 className="text-2xl font-bold text-gray-700">Welcome to Syllabus Consortium</h2>
              <p className="mt-4 text-gray-600">Please connect your wallet to continue</p>
            </div>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;