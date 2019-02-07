import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import Spinner from '../components/Spinner/Spinner';
import EventList from '../components/Events/EventsList/EventList';
import AuthContext from '../context/auth-context';

import './Events.css';

class EventsPage extends Component{
  state = {
    creating: false,
    events : [],
    isLoading: false,
    selectedEvent: null
  }
  isActive = true;

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
    this.setState({creating: false, selectedEvent: null});
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
        mutation CreateEvent(title: String!, desc: String!, price: Float!, date: String!) {
          createEvent(eventInput: {title: $title, description: $desc, price: $price, date: $date}){
            _id
            title
            description
            price
            date
          }
        }
      `,
      variables: {
        title: title,
        desc: description,
        price: price,
        date: date
      }
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
    this.setState({isLoading: true})
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
      if(this.isActive){
      this.setState({events: events, isLoading: false});
      }
    })
    .catch(err =>{
      console.log(err);
      if(this.isActive){
      this.setState({isLoading: false});
      }
    });
  }

  showDetailHandler = (eventId) => {
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(e => e._id === eventId);
      return {selectedEvent: selectedEvent};
    })
  }
  bookEventHandler = () => {
    if(!this.context.token){
      this.setState({selectedEvent: null})
      return;
    }
    const requestBody = {
      query: `
        mutation BookEvent(id: ID!){
          bookEvent(eventId: $id) {
            _id
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        id: this.state.selectedEvent._id
      }
    };

    fetch('http://localhost:9000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer ' + this.context.token 
      }
    })
    .then( res =>{
      if(res.status !== 200 && res.status !== 201){
        throw new Error('Failed');
      }
      return res.json();
    })
    .then( resData => {
      console.log(resData);
      this.setState({selectedEvent: null});
    })
    .catch(err =>{
      console.log(err);
    });
  }

  componentWillUnmount() {
    this.isActive = false;
  }
  render(){
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop/>}
        {this.state.creating && (
        <Modal 
          title="Add event" 
          canCancel 
          canConfirm 
          onCancel={this.modalCancel} 
          onConfirm={this.modalConfirm}
          cancelText="Cancel"
          confirmText="Confirm"
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
        {this.state.selectedEvent && (
          <Modal 
            title={this.state.selectedEvent.title} 
            canCancel 
            canConfirm 
            onCancel={this.modalCancel} 
            onConfirm={this.bookEventHandler}
            cancelText="Close"
            confirmText={this.context.token ? "Book" : "Confirm"}
          >
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
            <p>{this.state.selectedEvent.description}</p>
          </Modal>
          )}
        {this.context.token && (
          <div className="events-control">
            <p>Share your own events!</p>
            <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
          </div>
        )}
        {
          this.state.isLoading ? 
          <Spinner/>
          :
          <EventList 
            events={this.state.events}
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler}
          />
        }
      </React.Fragment>
    );
  }
}

export default EventsPage;