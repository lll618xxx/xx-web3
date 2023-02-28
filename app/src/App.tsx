import { useEffect, useMemo, useState } from 'react'
import { ethers } from "ethers";
import './App.scss'
import Loading from './components/Loading';
import Toast from './components/Toast';
import dayjs from 'dayjs'

declare var window: any

function App() {
  const [walletProvider, setWalletProvider] = useState<any>(null);
  const [etherscanProvider, setEtherscanProvider] = useState<any>(null);
  const [networkName, setNetworkName] = useState<string>("");
  const [balance, setBalance] = useState<string>();
  const [account, setAccount] = useState<string>("");
  const [formData, setFormData] = useState({ addressTo: "", amount: ""});
  const [tradeIsLoading, setTradeIsLoading] = useState<boolean>(false);
  const [popupShow, setPopupShow] = useState<boolean>(false);
  const [popupText, setpopupText] = useState<string>("");
  const [transactionsList, setTransactionsList] = useState<Array>([]);

  const sendBtnStaus = useMemo(() => {
    const { addressTo, amount } = formData;
    return account && !tradeIsLoading && !!addressTo && !!amount
  }, [formData, tradeIsLoading, account])

  const traceList = [
    {name: "addressTo", placeholder: "Address To", type: "text"},
    {name: "amount", placeholder: "Amount (ETH)", type: "text"},
  ]

  const tradeHistoryLimit = 9

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setPopup('请安装 MetaMask')
        return
      }

      const accounts = await walletProvider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      getAccountMsg(accounts[0])
    } catch (error) {
      console.log(error);
    }
  }

  // 检查钱包是否连接
  const checkIfWalletIsConnect = async () => {
    try {
      if (!window.ethereum) {
        setPopup('请安装 MetaMask')
        return
      }
    
      const accounts = await walletProvider.send("eth_accounts", []);

      if (accounts.length) {
        setAccount(accounts[0]);
        getAccountMsg(accounts[0])
      }

    } catch (error) {
      console.log(error);
    }
  };

  // 获取账户信息
  const getAccountMsg = async (curAccount:string) => {
    const network = await walletProvider.getNetwork();
    const balance = await walletProvider.getBalance(curAccount || account);
    setNetworkName(network.name);
    setBalance(ethers.utils.formatEther(balance));
  }

  const handleChange = (e:any, name:any) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  // 获取交易历史
  const getTradeHistory = (curAccount:string, curWorkName:string) => {
    // const mainnetProvider = new ethers.providers.EtherscanProvider(curWorkName || networkName, import.meta.env.ETHERSSCAN_API_KEY as string, { fetch });

    // const address = account; // 要查询的地址
    etherscanProvider.getHistory(account).then((transactions) => {
      transactions.sort((a, b) => b.timestamp - a.timestamp)
      setTransactionsList(transactions)
    });
  }

  // 转账交易
  const handleSend = async (e:any) => {
    const { addressTo, amount, } = formData;

    e.preventDefault();

    if (!account) {
      setPopup('请先连接钱包')
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
      setTradeIsLoading(false)
      setPopup('交易成功')
      getAccountMsg()

      const receiptHash = await etherscanProvider.getTransactionReceipt(receipt.hash);

      // 暂时先处理交易记录不是最新的问题
      setTimeout(() => {
        getTradeHistory()
      }, 3000)
    } catch (error) {
      setTradeIsLoading(false)
      setPopup(`交易失败，${JSON.stringify(error)}`)
    }
  }

  // 设置toast
  const setPopup = (popupText:string, popupShow:boolean=true) => {
    setpopupText(popupText)
    setPopupShow(popupShow)
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

  useEffect(() => {
    if (networkName) {
      setEtherscanProvider(new ethers.providers.EtherscanProvider(networkName, import.meta.env.ETHERSSCAN_API_KEY as string, { fetch }));
    }
  }, [networkName]);

  useEffect(() => {
    if (etherscanProvider) {
      getTradeHistory()
    }
  }, [etherscanProvider]);

  return (
    <div className="app flex-column flex-center">
      <div className='card'>
        <div className="card-account">account: <span className="card-value">{account}</span></div>
        <div>network: <span className="card-value">{networkName}</span></div>
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
      
      {Boolean(transactionsList.length) &&
        <div className="history-cotainer">
          <div className="history-title">最近{tradeHistoryLimit}条交易记录</div>
          <div className="history-main flex">
            {
              transactionsList.slice(0, tradeHistoryLimit).map((item, index) => {
                return (
                  <div className="history-item" key={index}>
                    <div className="history-head">To：{item.to.slice(0, 6)}......{item.to.slice(item.to.length-6, item.to.length)}</div>
                    <div className="history-time">Time: {dayjs(item.timestamp*1000).format('YYYY/MM/DD HH:mm:ss')}</div>
                    <div className="history-time">value: {ethers.utils.formatEther(item.value.toString())}</div>
                    <div className="history-time">gas: {ethers.utils.formatEther(item.gasPrice.toString())}</div>
                  </div>
                )
              })
            }
          </div>
        </div>
      }

      <Toast popupShow={popupShow} popupText={popupText} setPopupShow={setPopupShow}/>
    </div>
  )
}

export default App
