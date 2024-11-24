import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, LogOut, SwitchCamera, Info, BarChart } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { address, connect, disconnect, switchWallet } = useWallet();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [targetAddress, setTargetAddress] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSwitch = async () => {
    if (!targetAddress) {
      return;
    }
    await switchWallet(targetAddress);
    setShowSwitcher(false);
    setTargetAddress('');
  };

  const WalletInstructions = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-xl font-semibold mb-4">How to Import a Wallet</h3>
        <ol className="list-decimal list-inside space-y-3 mb-6">
          <li>Open MetaMask extension</li>
          <li>Click on the account icon in the top-right corner</li>
          <li>Select "Import Account"</li>
          <li>Enter the private key of the account you want to import</li>
          <li>Click "Import"</li>
        </ol>
        <p className="text-sm text-gray-600 mb-4">
          For testing, you can use these accounts:
        </p>
        <div className="space-y-2 mb-6">
          <div className="p-2 bg-gray-50 rounded">
            <p className="font-medium">Internal Accreditor:</p>
            <p className="text-sm font-mono break-all">0x431614100326Aa9CAED00ac8fa41945d51Be6D4c</p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setShowInstructions(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Syllabus Consortium
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/syllabi" className="text-gray-600 hover:text-gray-900">
                Syllabi
              </Link>
              <Link to="/proposals" className="text-gray-600 hover:text-gray-900">
                Proposals
              </Link>
              <Link to="/create-syllabus" className="text-gray-600 hover:text-gray-900">
                Create Syllabus
              </Link>
              <Link to="/analytics" className="text-gray-600 hover:text-gray-900 flex items-center">
                <BarChart className="w-4 h-4 mr-1" />
                Analytics
              </Link>
            </div>
          </div>
          {address ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </span>
              <button
                onClick={() => setShowSwitcher(!showSwitcher)}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                title="Switch wallet"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
              <button
                onClick={disconnect}
                className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                title="Disconnect wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Wallet Switcher Modal */}
      {showSwitcher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Switch Wallet</h3>
              <button
                onClick={() => setShowInstructions(true)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Info className="w-4 h-4 mr-1" />
                Help
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Address
                </label>
                <input
                  type="text"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  placeholder="Enter wallet address (0x...)"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <p className="text-sm text-gray-600">
                Make sure the address is imported in your MetaMask before switching.
              </p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSwitcher(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSwitch}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && <WalletInstructions />}
    </nav>
  );
}