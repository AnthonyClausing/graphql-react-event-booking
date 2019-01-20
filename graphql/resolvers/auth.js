const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');


/*the error messages in login would be 'incorrect crendentials' or something in prod
but for the sake of potentially easy debugging they'll be like clearly separate*/
// second argument of jwt.sign is a string that is used as a key to hash token
module.exports = { 
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
  login: async (args) => {
    const user = await User.findOne({ email: args.email });
    if(!user){
      throw new Error('User does not exist.'); 
    }
    const isEqual = await bcrypt.compare(args.password, user.password);
    if(!isEqual){
      throw new Error('Password is incorrect.')
    }
    const token = jwt.sign({userId: user.id, email: user.email}, 'somesecretkey',{
      expiresIn: '1h'
    });
    return {userId: user.id, token, tokenExpiration: 1}
  }
}