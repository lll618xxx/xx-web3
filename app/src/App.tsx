import { useEffect, useState } from 'react'
import { ethers } from "ethers";
import './App.scss'

declare var window: any

function App() {
  const [walletProvider, setWalletProvider] = useState<any>(null);
  const [networkName, setNetworkName] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [account, setAccount] = useState<string>("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask.");

      // const accounts = await window.ethereum.request({ method: "eth_requestAccounts", });
      // console.log(accounts, 'accounts')
      // // setCurrentAccount(accounts[0]);
      // // window.location.reload();
      const accounts = await walletProvider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      getAccountMsg(accounts[0])
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnect = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask.");
      // const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const accounts = await walletProvider.send("eth_accounts", []);

      if (accounts.length) {
        setAccount(accounts[0]);
        getAccountMsg(accounts[0])
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAccountMsg = async (curAccount:string) => {
    const network = await walletProvider.getNetwork();
    const balance = await walletProvider.getBalance(curAccount || account);
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
    <div className="app flex-center">
      <div className='card'>
        <div className="card-account">account: <span className="card-value">{account}</span></div>
        <div>networkName: <span className="card-value">{networkName}</span></div>
        <div>balance: <span className="card-value">{!Number(balance) ||Number(balance).toFixed(4)}</span></div>
        {!account && <button className="connet-btn" onClick={connectWallet}>Connet Wallet</button>}
      </div>
    </div>
  )
}

export default App
