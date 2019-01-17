const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const app = express();

const Event = require('./models/event')

app.use(bodyParser.json());
// Good thing about graphql is that you can tell the backend exactly what you want in your query from the frontend
// Adding ! after a type makes it not optional (not null)
//better practice to create a type for a list of args in createEvent instead of having a long list written out in the parentheses

app.use('/graphql', graphqlHttp({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String! 
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!

    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery 
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event.find()
        .then(events => {
          return events.map(event => {
            return { ...event._doc, _id: event.id };
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    createEvent: (args) => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date)
      })
      return event.save()
      .then(result => {
        return { ...result._doc, _id: result._doc._id.toString()};
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
    }
  },
  graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@cluster0-vcaax.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
)
.then(() => {
  app.listen(3000);
})
.catch(err => {
  console.log(err);
});
