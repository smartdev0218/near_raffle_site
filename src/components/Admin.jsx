import { useEffect, useState } from "react";
import * as nearAPI from "near-api-js";

export const Admin = (props) => {
  const [ticket_price, setTicketPrice] = useState(1);
  const [win_ticket, setWinnerNum] = useState(1);
  const [raffleList, setRaffleList] = useState([]);
  const [raffle_id, setRaffleId] = useState();
  const [raffle_title, setRaffleTitle] = useState();
  const [raffle_description, setRaffleDescription] = useState();
  const [raffle_created, setRaffleCreate] = useState(false);
  const [selectedFile, setFile] = useState(null);
  const [base64String, setBase64String] = useState("");

  useEffect(async () => {
    setRaffleCreate(false);
    await fetch('https://near-raffle-server.vercel.app/api/find')
    .then(response => response.json())
    .then(data => {
      setRaffleList(data);
      setRaffleId(data.length);
    });
  } ,[raffle_created])

  const onTicketPrice = (e) => {
      setTicketPrice(e.target.value);
  }
  
  const onWinnerNum = (e) => {
      setWinnerNum(e.target.value);
  }

  const onRaffleTitle = (e) => {
    setRaffleTitle(e.target.value);
  }

  const onRaffleDescription = (e) => {
      setRaffleDescription(e.target.value);
  }

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  }

  const onFileUpload = () => {
    if(selectedFile) {
      const formData = new FormData();
      formData.append(
        "myFile",
        selectedFile,
        selectedFile.name
      );
      var reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = function () {
        setBase64String(reader.result);
        console.log(base64String);
      }
    }
    else {
      alert("Please select file first!");
    }
  }
  
  const onCreate = async () => {
    if(raffle_title && raffle_description && selectedFile) {
      var ticket_supply = 0;
      var raffle_closed = false;
      var start_raffle= new Date().getTime();
      var start_year = new Date().getFullYear();
      var start_month = new Date().getMonth() + 1;
      var start_day = new Date().getDate();
      var start_hour = new Date().getHours();
      var start_min = new Date().getMinutes();
      var winners = [0];
      await fetch('https://near-raffle-server.vercel.app/api/register', {
        method: 'post',
        body: JSON.stringify({raffle_title, raffle_description, raffle_id, ticket_price, ticket_supply, win_ticket, raffle_closed, start_raffle, start_year, start_month, start_day, start_hour, start_min, base64String, winners}),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setRaffleCreate(true);
    }
    else {
      alert("Please input title or description or image for raffle!");
    }
  }

  return (
    <div className='adminpanel text-center'>
      <div className='container'>
        <div className='section-title'>
            <h2>Admin Panel</h2>
        </div>
        <div className='row'>
          <div className='adminpanel-items'>
            <div className = 'col-sm-6 col-md-6 col-lg-6'>
              <p>Title</p>
              <input type = 'text' class = 'form-control' value = {raffle_title} maxlength = '10' onChange = {onRaffleTitle}/>
            </div>
            <div className = 'col-sm-6 col-md-6 col-lg-6'>
              <p>Description</p>
              <input type = 'text' class = 'form-control' value = {raffle_description} maxlength = '10' onChange = {onRaffleDescription}/>
            </div>
            <div className = 'col-sm-6 col-md-6 col-lg-6'>
              <p>Ticket Price</p>
              <input type = 'number' class = 'form-control' value = {ticket_price} min = {1} onChange = {onTicketPrice}/>
            </div>
            <div className = 'col-sm-6 col-md-6 col-lg-6'>
              <p>Winner Num</p>
              <input type = 'number' class = 'form-control' value = {win_ticket} min = {1} max = {5} onChange = {onWinnerNum}/>
            </div>
            <div className = 'col-sm-12 col-md-12 col-lg-12'>
              <p>File Upload</p>
              <input type = 'File' class = 'form-control' onChange = {onFileChange}/>
            </div>
            <div className = 'col-sm-12 col-md-6 col-lg-6'>
              <button type = 'button' className = 'btn btn-warning btn-block' onClick = {onFileUpload}>File Upload</button>
            </div>
            <div className = 'col-sm-12 col-md-6 col-lg-6'>
              <button type = 'button' className = 'btn btn-warning btn-block' onClick = {onCreate}>Create Raffle</button><br/><br/><br/>
            </div>
            <div className = 'col text-center'>
              <p style = {{fontSize: '45px'}}>Raffle Collection: {raffle_id}</p><br/><br/><br/><br/><br/>
            </div>
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
