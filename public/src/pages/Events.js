import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import './Events.css';

class EventsPage extends Component{
  state = {
    creating: false
  }

  startCreateEventHandler = () => {
    this.setState({creating: true});
  }
  
  modalCancel = () => {
    this.setState({creating: false});
  };

  modalConfirm = () =>{
    this.setState({creating: false});
  };

  render(){
    return (
      <React.Fragment>
        {this.state.creating && <Backdrop/>}
        {this.state.creating && <Modal title="Add event" canCancel canConfirm onCancel={this.modalCancel} onConfirm={this.modalConfirm}>
        <p>modal content</p>
        </Modal>}
        <div className="events-control">
          <p>Share your own events!</p>
          <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
        </div>
      </React.Fragment>
    );
  }
}

export default EventsPage;