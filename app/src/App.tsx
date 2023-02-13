import { useEffect, useMemo, useState } from 'react'
import { ethers } from "ethers";
import './App.scss'
import Loading from './components/Loading';
import Toast from './components/Toast';

declare var window: any

function App() {
  const [walletProvider, setWalletProvider] = useState<any>(null);
  const [networkName, setNetworkName] = useState<string>("");
  const [balance, setBalance] = useState<string>();
  const [account, setAccount] = useState<string>("");
  const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [tradeIsLoading, setTradeIsLoading] = useState<boolean>(false);
  const [popupShow, setPopupShow] = useState<boolean>(false);
  const [popupText, setpopupText] = useState<string>("");

  const sendBtnStaus = useMemo(() => {
    const { addressTo, amount, keyword, message } = formData;
    return account && !tradeIsLoading && !!addressTo && !!amount && !!keyword && !!message 
  }, [formData, tradeIsLoading, account])

  const traceList = [
    {name: "addressTo", placeholder: "Address To", type: "text"},
    {name: "amount", placeholder: "Amount (ETH)", type: "text"},
    {name: "keyword", placeholder: "Keyword", type: "text"},
    {name: "message", placeholder: "Enter Message", type: "text"},
  ]

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

   const handleChange = (e:any, name:any) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const handleSend = async (e:any) => {
    const { addressTo, amount, keyword, message } = formData;

    e.preventDefault();

    if (!account) {
      setpopupText('请先连接钱包')
      setPopupShow(true)
      return
    }

    if (!sendBtnStaus) return;

    try {
      setTradeIsLoading(true)
      const value = ethers.utils.parseEther(amount);
      const signer = walletProvider.getSigner();

      const tx = {
        to: addressTo,
        value,
      };

      const receipt = await signer.sendTransaction(tx);
      await receipt.wait();
      setpopupText('交易成功')
      setPopupShow(true)
      setTradeIsLoading(false)
      getAccountMsg('')
    } catch (error) {
      setTradeIsLoading(false)
      setpopupText(`交易失败，${JSON.stringify(error)}`)
      setPopupShow(true)
    }
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
    <div className="app flex-column flex-center">
      <div className='card'>
        <div className="card-account">account: <span className="card-value">{account}</span></div>
        <div>networkName: <span className="card-value">{networkName}</span></div>
        <div>balance: <span className="card-value">{!Number(balance) ||Number(balance).toFixed(4)}</span></div>
        {!account && <button className="connet-btn" onClick={connectWallet}>Connet Wallet</button>}
      </div>

       <div className='card trade flex-column'>
         {
          traceList.map((item, index) => {
            return (
              <input
                disabled={tradeIsLoading}
                key={index}
                placeholder={item.placeholder}
                type={item.type}
                onChange={(e) => handleChange(e, item.name)}
              />
            )
          })
         }
         <button className={`trade-send ${!sendBtnStaus && "trade-send-disabled"}`} onClick={handleSend}>
            Send
          </button>
          {tradeIsLoading && <Loading 
            isCenter={true} 
          />}
      </div>

      <Toast popupShow={popupShow} popupText={popupText} setPopupShow={setPopupShow}/>
    </div>
  )
}

export default App
