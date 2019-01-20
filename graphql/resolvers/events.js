const Event = require('../../models/event');
const User = require('../../models/user');

const { dateToString } = require('../../helpers/date');
const { transformEvent } = require('./merge');

/*with resolvers you have access to the request object as the second argument 
which we can use while creating an event to see if a user is authenticated */
module.exports = {
  events: async () => {
    try{
      const events = await Event.find()
      return events.map(event => transformEvent(event));
    } catch(err) {
        throw err;
    }
  },
  createEvent: async (args,req) => {
    if(!req.isAuth){
      throw new Error('Unauthenticated');
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: dateToString(args.eventInput.date),
      creator: req.userId
    })
    let createdEvent;
    try{
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await User.findById(req.userId);

      if(!creator) {
        throw new Error('User not found.');
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch(err) {
      throw err;
    }
  }
}