const DataLoader = require('dataloader');

const Event = require('../../models/event');
const User = require('../../models/user');

const { dateToString } = require('../../helpers/date');

const eventLoader = new DataLoader((eventIds) => {
  return events(eventIds);
});

const userLoader = new DataLoader((userIds) => {
  return User.find({_id: {$in: userIds}})
});

//Using both these functions allows for the obtaining of any related data for as deep as necessary in a graphql query
//This function gets all events in a list of event ids using the mongodb operator $in
const events = async eventIds => {
  try {
  const events = await Event.find({_id: {$in: eventIds}})
  return events.map(event => transformEvent(event));
  } catch(err) {
    throw err;
  }  
}

const singleEvent = async eventId => {
  try{
    const event = await eventLoader.load(eventId.toString());
    return event;
  } catch(err) {
    throw err;
  }
}
const transformEvent = event => { 
  return {
    ...event._doc, 
    _id: event.id, 
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator)
  };
}

const transformBooking = booking =>{
  return {
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  }
}

//This function is used to grab the user(creator) associated with an event and populate the creator property

const user = async userId => {
  try{ 
    const user = await userLoader.load(userId.toString());
    return {
      ...user._doc, 
      _id: user.id, 
      createdEvents: () => eventLoader.loadMany.bind(this, user._doc.createdEvents)
    };
  } catch(err) {
    throw err;
  }
}

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;