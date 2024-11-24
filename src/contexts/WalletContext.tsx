import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../lib/contract';
import type { Role } from '../lib/types';
import toast from 'react-hot-toast';

interface WalletContextType {
  address: string | null;
  role: Role;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchWallet: (targetAddress: string) => Promise<void>;
  contract: ethers.Contract | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  role: 'none',
  connect: async () => {},
  disconnect: () => {},
  switchWallet: async () => {},
  contract: null,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [role, setRole] = useState<Role>('none');
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const connect = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const userAddress = accounts[0];
      setAddress(userAddress);

      // Get contract instance
      const contractInstance = await getContract();
      setContract(contractInstance);

      // Determine user role
      const [isUniv, internalAcc, externalAcc] = await Promise.all([
        contractInstance.isUniversity(userAddress),
        contractInstance.internalAccreditor(),
        contractInstance.externalAccreditor(),
      ]);

      if (userAddress.toLowerCase() === internalAcc.toLowerCase()) {
        setRole('internalAccreditor');
      } else if (userAddress.toLowerCase() === externalAcc.toLowerCase()) {
        setRole('externalAccreditor');
      } else if (isUniv) {
        setRole('university');
      } else {
        setRole('none');
      }

      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const switchWallet = async (targetAddress: string) => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask');
        return;
      }

      // Get all accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Check if target address is in available accounts
      const targetFound = accounts.find(
        (acc: string) => acc.toLowerCase() === targetAddress.toLowerCase()
      );

      if (!targetFound) {
        toast.error('Please add the target address to your MetaMask accounts');
        return;
      }

      // Switch to the target account
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13881' }], // Mumbai testnet
      });

      await window.ethereum.request({
        method: 'eth_requestAccounts',
        params: [{ eth_accounts: [targetAddress] }],
      });

      // Reconnect with new account
      await connect();
      
      toast.success('Switched to new wallet address');
    } catch (error) {
      console.error('Error switching wallet:', error);
      toast.error('Failed to switch wallet. Please switch manually in MetaMask');
    }
  };

  const disconnect = () => {
    setAddress(null);
    setRole('none');
    setContract(null);
    toast.success('Wallet disconnected');
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          if (accounts.length > 0) {
            connect();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', connect);
        window.ethereum.removeListener('chainChanged', () => {
          window.location.reload();
        });
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{ 
      address, 
      role, 
      connect, 
      disconnect, 
      switchWallet,
      contract 
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}