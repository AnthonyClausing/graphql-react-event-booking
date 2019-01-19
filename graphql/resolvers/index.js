const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking')

//Using both these functions allows for the obtaining of any related data for as deep as necessary in a graphql query
//This function gets all events in a list of event ids using the mongodb operator $in
const events = async eventIds => {
  try {
  const events = await Event.find({_id: {$in: eventIds}})
  return events.map(event => {
      return {
        ...event._doc, 
        _id: event.id, 
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
  } catch(err) {
    throw err;
  }  
}

const singleEvent = async eventId => {
  try{
    const event = await Event.findById(eventId);
    return { 
      ...event._doc, 
      _id: event.id,
      date: new Date(event._doc.date).toISOString(), 
      creator: user.bind(this, event.creator)
    }
  } catch(err) {
    throw err;
  }
}

//This function is used to grab the user(creator) associated with an event and populate the creator property

const user = async userId => {
  try{ 
  const user = await User.findById(userId)
  return {...user._doc, _id: user.id, createdEvents: events.bind(this, user._doc.createdEvents)};
  } catch(err) {
    throw err;
  }
}

module.exports = {
  events: async () => {
    try{
      const events = await Event.find()
      return events.map(event => {
        return { 
          ...event._doc, 
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        };
      });
    } catch(err) {
        throw err;
    }
  },

  bookings: async () =>{
    try{
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()

        }
      })
    } catch(err) {
      throw err;
    }
  },
  createEvent: async (args) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5c423a1ad4af041b9c762201"
    })
    let createdEvent;
    try{
      const result = await event.save()
      createdEvent = { 
        ...result._doc, 
        _id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(), 
        creator: user.bind(this, result._doc.creator)
      };
      const creator = await User.findById('5c423a1ad4af041b9c762201');
      if(!creator) {
        throw new Error('User not found.');
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch(err) {
      throw err;
    }
  },
  createUser: async (args) => {
    try{
      const existingUser = await User.findOne({email: args.userInput.email})
      if(existingUser){
        throw new Error('User already exists.');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
      const user = new User ({
          email: args.userInput.email,
          password: hashedPassword
      })
      const result = await user.save();
      return { ...result._doc, _id: result._doc._id.toString(), password: null};
    }catch(err){
      throw err;
    }
  },
  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: '5c423a1ad4af041b9c762201',
      event: fetchedEvent
    });
    const result = await booking.save();
    return {
      ...result._doc, 
      _id: result.id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),  
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString()
    };
  },
  cancelBooking: async args => {
    try{
      const booking = await Booking.findById({_id: args.bookingId}).populate('event')
      const event = {
        ...booking.event._doc,
        _id: booking.event.id, 
        creator: user.bind(this, booking.event._doc.creator)
      }
      console.log(event)
      await Booking.deleteOne({_id: args.bookingId});
      return event;
    } catch(err){
      throw err;
    }
  }
}