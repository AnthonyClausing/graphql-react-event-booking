const eventsResolver = require('./events');
const bookingResolver = require('./booking');
const authResolver = require('./auth');

const rootResolver = { 
  ...eventsResolver, 
  ...bookingResolver, 
  ...authResolver
}

module.exports = rootResolver;