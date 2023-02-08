import { useEffect, useState } from 'react'
import { ethers } from "ethers";
import './App.scss'

function App() {
  const [walletProvider, setWalletProvider] = useState<any>(null);
  const [networkName, setNetworkName] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [account, setAccount] = useState<string>("");

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      // const accounts = await ethereum.request({ method: "eth_requestAccounts", });
      // console.log(accounts, 'accounts')
      // // setCurrentAccount(accounts[0]);
        console.log(walletProvider, 'walletProvider22222')
      // // window.location.reload();
      const accounts = await walletProvider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      getAccountMsg()
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      console.log(walletProvider, 'walletProvider222')
      // const accounts = await ethereum.request({ method: "eth_accounts" });
      const accounts = await walletProvider.send("eth_accounts", []);

      if (accounts.length) {
        setAccount(accounts[0]);
        getAccountMsg()
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAccountMsg = async () => {
    const network = await walletProvider.getNetwork();
    const balance = await walletProvider.getBalance(account);
    setNetworkName(network.name);
    setBalance(ethers.utils.formatEther(balance));
  }

  
  useEffect(() => {
    if (!window.ethereum) {
      return;
    }
    setWalletProvider(
      new ethers.providers.Web3Provider(window.ethereum as any)
    );

  }, []);

   useEffect(() => {
     if (walletProvider) {
        checkIfWalletIsConnect()
     }
  }, [walletProvider]);

  return (
    <div className="app">
      <button className="connet-btn" onClick={connectWallet}>Connet Wallet</button>

      <div className='card'>
        <div>networkName: {networkName}</div>
        <div>balance: {balance}</div>
      </div>
    </div>
  )
}

export default App
