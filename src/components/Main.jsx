import { useEffect, useState } from "react";
import * as nearAPI from "near-api-js";

export const Main = (props) => {
  const { connect, keyStores, WalletConnection} = nearAPI;
  const [raffleList, setRaffleList] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  const [raffle_id, setRaffleId] = useState();
  const [raffle_created, setRaffleCreate] = useState(false);

  const config = {
    networkId: "testnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };

  useEffect(async () => {
    setRaffleCreate(false);

    await fetch('http://localhost:5000/api/find')
    .then(response => response.json())
    .then(data => {
      // setRaffleList(data);
      var array = [];
      for ( var i = 0; i < data.length; i ++ ) {
        if (data[i].raffle_closed == false) {
          array.push(data[i]);
          setRaffleList(array);
          setRaffleId(array.length);
        }
      }
      
    });

    await fetch('http://localhost:5000/api/findTicket')
    .then(response => response.json())
    .then(data => {
      setTicketList(data);
    });
  }, [raffle_created])

  const onSetWinners = async (raffle) => {
    var id = raffle._id;
    var winners = [];
    for ( var i = 0; i < raffle.win_ticket; i ++ ) {
      winners.push(Math.floor(Math.random() * raffle.ticket_supply) + 1);
    }
    
    await fetch('http://localhost:5000/api/update2', {
      method: 'post',
      body: JSON.stringify({id, winners}),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  const interval = setInterval(async () => {
    var currentTime = new Date().getTime();
    for (var i = 0 ; i < raffleList.length; i ++ ){
      if(currentTime - raffleList[i].start_raffle >= 86400000) {
        var id = raffleList[i]._id;
        await fetch('http://localhost:5000/api/update1', {
          method: 'post',
          body: JSON.stringify({id}),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        onSetWinners(raffleList[i]);
      }
    }
    
    return () => clearInterval(interval);
  }, 1000);

  const onDisplayTicket = (raffle) => {
    var ticket = [];
    for (var i = 0; i < ticketList.length; i ++) {
      if( ticketList[i].account_id == props.accountId && ticketList[i].raffle_id == raffle.raffle_id) {
        ticket.push(ticketList[i].ticket_supply + ",");
      }
    }
    return ticket;
  }

  const onBuyTicket = async (raffle) => {
    const near = await connect(config);
    const wallet =  new WalletConnection(near);
    const contract = await new nearAPI.Contract(
      wallet.account(),
      "near_ft3.testnet",
      {
        viewMethods: ["ft_balance_of"],
        changeMethods: ["ft_transfer"],
        sender: wallet.getAccountId(),
      }
    );

    contract.ft_transfer({
      receiver_id: "near_ft3.testnet",
      amount: "100000000"
    }, "", "0.000000000000000000000001");

    // var balance = await contract.ft_balance_of({
    //   account_id: "near_exam1.testnet"
    // });
    // console.log(balance);
    
    // var account_id = props.accountId;
    // var raffle_id = raffle.raffle_id;
    // var ticket_supply = raffle.ticket_supply + 1;
    // var id = raffle._id;
    // await fetch('http://localhost:5000/api/registerTicket', {
    //     method: 'post',
    //     body: JSON.stringify({account_id, raffle_id, ticket_supply}),
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    // });

    // await fetch('http://localhost:5000/api/update', {
    //     method: 'post',
    //     body: JSON.stringify({id, ticket_supply}),
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    // });  

    // setRaffleCreate(true);
  }

  return (
    <div className='main text-center'>
        <div className='container'>
          <div className='section-title'>
            <h2>{props.accountId}</h2>
            <h3>Live Raffles: {raffle_id}</h3>
          </div>
          <div className='row'>
            <div className='main-items'>
              {!raffleList.length ? <></> :
                raffleList.map((v, i) =>
                  <div key = {i} className='col-sm-12 col-md-6 col-lg-4'>
                    <div style={{borderStyle: 'solid', borderWidth: '5px', borderColor: '#333', borderRadius: '10px', margin: '20px'}}>
                      <p>Raffle ID: {v.raffle_id + 1}</p>
                      <div style = {{padding: '20px'}}>
                        <img src = {v.base64String} alt = "image" height = "20%" width = "80%"/>
                      </div>
                      <p>{v.raffle_title}</p>
                      <div>
                        <p>{v.raffle_description}</p>
                      </div>
                      <hr/>
                      <p>Start: {v.start_year}/{v.start_month}/{v.start_day} {v.start_hour}:{v.start_min}</p>
                      <p>Duration: 1 day</p>
                      <p>Ticket Price: {v.ticket_price} $FLIP</p>
                      <p>Winners: {v.win_ticket}</p>
                      <p>$FLIP sent: {v.ticket_price * v.ticket_supply} $FLIP</p>
                      <p>Ticket sold: {v.ticket_supply}</p>
                      <p>Your Tickets: {onDisplayTicket(v)}</p>
                      {v.raffle_closed == false ?
                        <p>Closed: False</p> : 
                        <p>Closed: True</p>}
                      <hr/>
                      <button type = 'button' className = 'btn btn-warning btn-block' onClick = {()=> onBuyTicket(v)}>Buy Ticket</button>
                    </div>
                  </div>
                )
              }
            </div>
          </div>
        </div>
    </div>
  )
}
