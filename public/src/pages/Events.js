import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import EventList from '../components/Events/EventsList/EventList';
import AuthContext from '../context/auth-context';
import './Events.css';

class EventsPage extends Component{
  state = {
    creating: false,
    events : []
  }

  static contextType = AuthContext;

  constructor(props){
    super(props);
    this.titleEl = React.createRef();
    this.priceEl = React.createRef();
    this.dateEl = React.createRef();
    this.descriptionEl = React.createRef();
  }

  componentDidMount(){
    this.fetchEvents();
  }

  startCreateEventHandler = () => {
    this.setState({creating: true});
  }
  
  modalCancel = () => {
    this.setState({creating: false});
  };

  modalConfirm = () => {
    const title =  this.titleEl.current.value;
    const price =  +this.priceEl.current.value;
    const date =  this.dateEl.current.value;
    const description = this.descriptionEl.current.value;

    if(!title.trim().length || price <= 0 || !date.trim().length || !description.trim().length){
      return;
    }

    const requestBody = {
      query: `
        mutation {
          createEvent(eventInput: {title: "${title}", description:"${description}", price: ${price}, date: "${date}"}){
            _id
            title
            description
            price
            date
          }
        }
      `
    };

    const token = this.context.token;

    fetch('http://localhost:9000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
    .then(res =>{
      if(res.status !== 200 && res.status !== 201){
        throw new Error('Failed');
      }
      return res.json();
    })
    .then(resData => {
      this.setState(prevState =>{
        const newEvent = {
          _id:  resData.data.createEvent._id,
          title: resData.data.createEvent.title,
          description:  resData.data.createEvent.description,
          price:  resData.data.createEvent.price,
          creator: {
            _id: this.context.userId
          } 
        }
        return {events: [...prevState.events, newEvent]};
      });
      this.modalCancel();
    })
    .catch(err =>{
      console.log(err);
    });
  };

  fetchEvents() {
    const requestBody = {
      query: `
        query {
          events {
            _id
            title
            description
            price
            date
            creator {
              _id
              email
            }
          }
        }
      `
    };

    fetch('http://localhost:9000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type' : 'application/json',
      }
    })
    .then( res =>{
      if(res.status !== 200 && res.status !== 201){
        throw new Error('Failed');
      }
      return res.json();
    })
    .then( resData => {
      const events = resData.data.events;
      this.setState({events: events});
    })
    .catch(err =>{
      console.log(err);
    });
  }

  render(){
    return (
      <React.Fragment>
        {this.state.creating && <Backdrop/>}
        {this.state.creating && (
        <Modal 
          title="Add event" 
          canCancel 
          canConfirm 
          onCancel={this.modalCancel} 
          onConfirm={this.modalConfirm}
        >
          <form>
            <div className="form-control">
              <label htmlFor="title">Title</label>
              <input type="text" id="title" ref={this.titleEl}></input>     
            </div>
            <div className="form-control">
              <label htmlFor="price">Price</label>
              <input type="number" id="price" ref={this.priceEl}></input>     
            </div>
            <div className="form-control">
              <label htmlFor="date">Date</label>
              <input type="datetime-local" id="date"ref={this.dateEl}></input>     
            </div>
            <div className="form-control">
              <label htmlFor="description">Description</label>
              <textarea type="text" id="description" rows="4" ref={this.descriptionEl}/>     
            </div>
          </form>
        </Modal>
        )}
        {this.context.token && (
          <div className="events-control">
            <p>Share your own events!</p>
            <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
          </div>
        )}
        <EventList events={this.state.events} authUserId={this.context.userId}/>
      </React.Fragment>
    );
  }
}

export default EventsPage;