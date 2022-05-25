import { useEffect, useState } from "react";
import * as nearAPI from "near-api-js";

export const Closed = (props) => {

  const [raffleList, setRaffleList] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  const [raffle_id, setRaffleId] = useState();

  useEffect(async () => {
    await fetch('https://near-raffle-server.vercel.app/api/find')
    .then(response => response.json())
    .then(data => {
      var array = [];
      for ( var i = 0; i < data.length; i ++ ) {
        if (data[i].raffle_closed == true) {
          array.push(data[i]);
          setRaffleList(array);
          setRaffleId(array.length);
        }
      }
    });

    await fetch('https://near-raffle-server.vercel.app/api/findTicket')
    .then(response => response.json())
    .then(data => {
      setTicketList(data);
    });
  }, [])

  const onDisplayTicket = (raffle) => {
    var ticket = [];
    for (var i = 0; i < ticketList.length; i ++) {
      if( ticketList[i].account_id == props.accountId && ticketList[i].raffle_id == raffle.raffle_id) {
        ticket.push(ticketList[i].ticket_supply + ",");
      }
    }
    return ticket;
  }

  return (
    <div className='closed text-center'>
      <div className='container'>
        <div className='section-title'>
            <h2>{props.accountId}</h2>
            <h3>Closed Raffles: {raffle_id}</h3>
        </div>
        <div className='row'>
          <div className='closed-items'>
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
                      <p>Ticket Price: {v.ticket_price} $FLIP</p>
                      <p>Winners: {v.win_ticket}</p>
                      <p>$FLIP sent: {v.ticket_price * v.ticket_supply} $FLIP</p>
                      <p>Ticket sold: {v.ticket_supply}</p>
                      <p>Your Tickets: {onDisplayTicket(v)}</p>
                      {v.raffle_closed == false ?
                        <p>Closed: False</p> : 
                        <p>Closed: True</p>}
                      <hr/>
                      <p>Winning Tickets: {v.winners}</p>
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
