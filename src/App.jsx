import { useState, useEffect } from 'react'
import { Navigation } from './components/navigation'
import { Main } from './components/Main'
import { Login } from './components/Login'
import { Closed } from './components/Closed'
import { Admin } from './components/Admin'
import SmoothScroll from 'smooth-scroll'
import * as nearAPI from 'near-api-js'
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
})

const App = () => {
  const [account_id, setAccount] = useState("");
  const { connect, KeyPair, keyStores, WalletConnection} = nearAPI;

  const config = {
    networkId: "testnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };
  useEffect(async () => {
    const near = await connect(config);
    const wallet =  new WalletConnection(near);
    // const contract = await new nearAPI.Contract(
    //   wallet.account(),
    //   "near_ft3.testnet",
    //   {
    //     viewMethods: ["ft_balance_of"],
    //     changeMethods: ["ft_transfer"],
    //     sender: wallet.getAccountId(),
    //   }
    // );
    // const response = await contract.get_balance({account_id: wallet.getAccountId()}) / 10000000000000000000000;
    setAccount(wallet.getAccountId());
  })
  return (
    <div>
      <Navigation/>
      { !account_id ? <Login /> : account_id == "coin-flip.testnet" ? <Admin /> :
        <Router>
          <Routes>
            <Route path=  "/" element = {<Main accountId = {account_id}/>}></Route>
            <Route path=  "/closed" element = {<Closed accountId = {account_id}/>}></Route>
          </Routes>
        </Router>
      }
    </div>
  )
}

export default App
