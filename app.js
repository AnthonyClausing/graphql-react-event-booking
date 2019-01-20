const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQLSchema = require('./graphql/schema/index');
const graphQLResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());

app.use(isAuth);
// Good thing about graphql is that you can tell the backend exactly what you want in your query from the frontend
// Adding ! after a type makes it not optional (not null)
//better practice to create a type for a list of args in createEvent instead of having a long list written out in the parentheses
app.use('/graphql', graphqlHttp({
  schema: graphQLSchema,
  rootValue: graphQLResolvers,
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
