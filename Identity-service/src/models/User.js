const mongoose = require('mongoose');
const argon2 = require('argon2');
// argon2 is a password-hashing function alternative to bcrypt

const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email:{
     type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password:{
    type: String,
    required: true,
  },
  createdAt:{
    type: Date,
    default: Date.now,
  }
} , {timestamps: true});

// Hash the password before saving the user model

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
       try {
        this.password = await argon2.hash(this.password);
        next();
       } catch (error) {
          console.log(error); 
          return next(error);
       }
    }
});

// Compare the password with the hashed password

userSchema.methods.comparePassword = async function(password){
  try {
    return await argon2.verify(this.password, password);
  } catch (error) {
    throw new Error(error);
  }
}
// Create an index for the username field this will help to search the user by username
userSchema.index({username: 'text'});

// Create a model
const User = mongoose.model('UserSocialMedia', userSchema); 

module.exports = User;