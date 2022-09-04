import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import {ethers, providers} from "ethers";

export default function Home() {
  //ENS
  const [ens, setENS] = useState("");
  //保存当前连接的账户的地址
  const [address, setAddress] = useState("");
  //跟踪钱包是否连接
  const [walletConnected, setWalletConnected] = useState(false);
  //创建一个对WE3Modald（用于连接钱包）的引用，该引用在页面打开时保持不变
  const web3ModalRef = useRef();

  /**
   * 设置ENS，如果当前连接的地址有一个相关的ENS，或者它设置已连接账户的地址
   */
  const setENSorAddress = async (address, web3Provider) =>{
    //查阅与指定地址有关的ENS
    var _ens = await web3Provider.lookupAddress(address);
    //如果地址有ENS，则设置ENS或只设置地址
    if(_ens){
      setENS(_ens);
    }else{
      setAddress(address);
    }
  };

  /**
   * provider 读取事务，读取余额，读取状态等交互
   * signer 写入事务，请求用户签名
   */
  const getProviderOrSigner = async() =>{
    //连接到钱包
    //因为我们存储web3Modal作为引用，所有我们需要访问current值来访问底层对象
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    //如果用户没连接到Rinkeby 网络，让他们知道并抛出一个错误
    const {chainId} = await web3Provider.getNetwork();
    if(chainId !== 4 ) {
      window.alert("你连接的不是Rinkeby网络");
      throw new Error("请改变网络为Rinkeby");
    }

    const signer = web3Provider.getSigner();
    //获取与连接到钱包的签名者关联的地址
    const address = await signer.getAddress();
    //调用函数设置ENS或Address
    await setENSorAddress(address,web3Provider);
    return signer;
  };

  /**
   * 连接钱包
   */
  const connectWallet= async () => {
    try {
      //从文本Modal获取提供者，在我们的示例中时MEtaMask
      //第一次使用，它会提示用户连接他们的钱包
      await getProviderOrSigner(true);
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton =() =>{
     if(walletConnected){
      <div>Wallet connected</div>
     }else{
      return (
        <button onClick={connectWallet} className ={styles.button}>
          Connect your wallet 
        </button>
      );
     }
  };

  useEffect(() => {
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network:"rinkeby",
        providerOptions:{},
        disableInjectedProvider:false,
      });
      connectWallet();
    }
  },[walletConnected]);

  return (
    <div>
      <Head>
        <title>ENS Dapp</title>
        <meta name="description" content='ENS-Dapp'/>
        <link rel='icon' href='favicon.ico' />
      </Head>
      <div className={styles.main}>
          <div>
            <h1 className={styles.title}>
              Welcome to LearnWeb3 Pubks {ens ? ens :address}
            </h1>
            <div className={styles.description}>
              Its an NFT collection for LearnWeb3 Punks
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="./learnweb3punks.png"/>
          </div>
      </div>
      <footer className={styles.footer}>
        Made with by LearnWeb3 punks
      </footer>
    </div>
  )
}
