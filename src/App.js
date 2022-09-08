import './App.css';
import React, { useEffect, useState } from 'react';
import abi from './utilis/Whitelist.json';
import { ethers } from 'ethers';

function App() {

  const [currentAccount, setCurrentAccount] = useState('');
  const [chainId, setChainId] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading,setIsLoading]= useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const contractAddress = '0x1009e25C8AfB8531C4300f5959AdeaA72959141c';
  let contractABI = abi.abi;


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      const provider = new ethers.providers.Web3Provider(ethereum);
      const network = await provider.getNetwork(); 
      const chainId = network.chainId; //this statement returns 4 for rinkeby
      setChainId(chainId);

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        await getNumberOfWhitelisted();
        await checkIfAddressInWhitelist();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {  
 checkIfWalletIsConnected();
 //eslint-disable-next-line
  }, []);


  const connectWallet = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Install Metamask")
    }
    else {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected:", accounts[0]);
     
      const changeChain = async () => {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: '0x4'
            }]
        });
      }
      await changeChain();
      setCurrentAccount(accounts[0]);
      alert('Wallet is successfully Connected');
      setChainId(4);
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    }
  }


  const joinWhitelist = async () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length == 0) {
        alert("Please connect your wallet");
        return;
      }
    }
    else {
      alert("Please install metamask and connect wallet");
      return;
    }

    const { ethereum } = window;
    if (ethereum && chainId == 4) {
      try{
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const whitelistContract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx= await whitelistContract.participate();
      setIsLoading(true);
      await tx.wait();
      setIsLoading(false);
      document.getElementById('InputId').value = '';
      await getNumberOfWhitelisted();
      setIsJoined(true);

      }
      catch (err) {
        console.error(err);
      }

    }
    else if (chainId !== 4){alert("Please switch to Rinkeby Testnet");}
  }


  const checkIfAddressInWhitelist = async () => {
    if(window.ethereum){
    try {
      // We will need the signer later to get the user's address
      // Even though it is a read transaction, since Signers are just special kinds of Providers,
      // We can use it in it's place
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const whitelistContract = new ethers.Contract(contractAddress, contractABI, signer);

      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      // check user already whitelisted or not
      const _joinedWhitelist = await whitelistContract.alreadyParticipated(address);
      
      setIsJoined(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  }
  };


  const getNumberOfWhitelisted = async () => {
    if(window.ethereum){
    try {
      const {ethereum}= window;
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = new ethers.providers.Web3Provider(ethereum);
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const whitelistContract = new ethers.Contract(contractAddress, contractABI, provider);
      const _numberOfWhitelisted = await whitelistContract.slotsFilled();
      setNumberOfWhitelisted(_numberOfWhitelisted.toNumber());
    } catch (err) {
      console.error(err);
    }
  }
  };

  return (
   
    <div className="main">
      <div className="container">
       <a href="https://rinkeby.etherscan.io/address/0x1009e25C8AfB8531C4300f5959AdeaA72959141c" className='track'>Track Whitelisted Addresses</a>

        <h1 className='headings'>Early Bird Offer, <span className='glow'>Join Whitelist for free.</span></h1>
       
        <h2 className='headings'>The earlier you are, the luckier you will get.</h2>
      
        <div className="box">
          <input type="email" id='InputId' placeholder='Enter your email' className='texty' />

         {isJoined ? <b className='thanks'>Thanks for joining the Whitelist !</b> : isLoading ? <button className="btn-1">Loading ...</button> : <button className="btn-1" onClick={joinWhitelist}>Join Whitelist !</button>}
      
          <h3 className='slotsinfo'>{10-numberOfWhitelisted} places remaining</h3>
          <h3 className='slotsinfo'>{numberOfWhitelisted} have joined the whitelist</h3>

          {!currentAccount ? (<button className="btn-2" onClick={connectWallet}>Connect Wallet</button>) : (<b className='bold'>Account Address: {currentAccount}</b>)}
        </div>
      </div>
      <footer>
        <b>Created by @Divyansh</b>
      </footer>
    </div>

  );
}

export default App;