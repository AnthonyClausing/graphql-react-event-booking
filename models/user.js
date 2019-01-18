const mongoose = require('mongoose');

const Schema = mongoose.Schema;
//'ref' is important internally for mongoose as it will allow it to know about the relation
const userSchema = new Schema({
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    createdEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Event'
      }
    ]
});

module.exports = mongoose.model('User', userSchema);