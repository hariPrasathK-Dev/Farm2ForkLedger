import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [contract, setContract] = useState(null);

  // Contract configuration
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  // Import the actual contract ABI
  let CONTRACT_ABI;
  try {
    CONTRACT_ABI = require("../contracts/SupplyChain.json").abi;
  } catch (error) {
    console.warn("Could not load contract ABI, using minimal ABI");
    CONTRACT_ABI = [
      "function hasRole(bytes32 role, address account) external view returns (bool)",
      "function FARMER_ROLE() external view returns (bytes32)",
      "function MANUFACTURER_ROLE() external view returns (bytes32)",
      "function LOGISTICS_ROLE() external view returns (bytes32)",
      "function RETAILER_ROLE() external view returns (bytes32)",
      "function ADMIN_ROLE() external view returns (bytes32)",
    ];
  }

  // Role constants (these should match the smart contract)
  const ROLES = {
    FARMER: "FARMER_ROLE",
    MANUFACTURER: "MANUFACTURER_ROLE",
    LOGISTICS: "LOGISTICS_ROLE",
    RETAILER: "RETAILER_ROLE",
    ADMIN: "ADMIN_ROLE",
  };

  useEffect(() => {
    // Check if user is already connected
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (account && provider && CONTRACT_ADDRESS) {
      initializeContract();
      checkUserRole();
    }
  }, [account, provider]);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          const signer = await provider.getSigner();
          setSigner(signer);
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed! Please install MetaMask.");
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      const signer = await provider.getSigner();
      setSigner(signer);

      setAccount(accounts[0]);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setUserRole(null);
    setContract(null);
    toast.info("Wallet disconnected");
  };

  const initializeContract = async () => {
    if (!CONTRACT_ADDRESS || !provider) return;

    try {
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      setContract(contractInstance);
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  const checkUserRole = async () => {
    if (!contract || !account) return;

    try {
      const roles = [];

      // Check each role
      for (const [roleName, roleFunction] of Object.entries(ROLES)) {
        const roleHash = await contract[roleFunction]();
        const hasRole = await contract.hasRole(roleHash, account);
        if (hasRole) {
          roles.push(roleName);
        }
      }

      setUserRole(roles.length > 0 ? roles : null);
    } catch (error) {
      console.error("Error checking user role:", error);
      setUserRole(null);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const switchToCorrectNetwork = async () => {
    if (!window.ethereum) return false;

    try {
      // Try to switch to the Besu network (chainId 2024)
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7E8" }], // 2024 in hex
      });
      return true;
    } catch (switchError) {
      // Network doesn't exist, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x7E8",
                chainName: "Rich's Pizza Besu Network",
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["http://localhost:8545"],
                blockExplorerUrls: null,
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Error adding network:", addError);
          return false;
        }
      }
      console.error("Error switching network:", switchError);
      return false;
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const hasRole = (role) => {
    return userRole && userRole.includes(role);
  };

  const value = {
    account,
    provider,
    signer,
    userRole,
    contract,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToCorrectNetwork,
    formatAddress,
    hasRole,
    ROLES,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
