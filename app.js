const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const events = [];

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
      return events;
    },
    createEvent: (args) => {
      const event = {
        _id: Math.random().toString(),
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: args.eventInput.date
      }
      events.push(event);
      return event
    }
  },
  graphiql: true
}));

app.listen(3000);