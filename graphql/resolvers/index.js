const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');

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
  }
}