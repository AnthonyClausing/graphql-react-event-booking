const Booking = require('../../models/booking');
const Event = require('../../models/event');

const {transformBooking, transformEvent} = require('./merge');

module.exports = {

  bookings: async () =>{
    try{
      const bookings = await Booking.find();
      return bookings.map(booking => transformBooking(booking))
    } catch(err) {
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
    return transformBooking(result);
  },
  cancelBooking: async args => {
    try{
      const booking = await Booking.findById({_id: args.bookingId}).populate('event')
      const event = transformEvent(booking.event);
      await Booking.deleteOne({_id: args.bookingId});
      return event;
    } catch(err){
      throw err;
    }
  }
}