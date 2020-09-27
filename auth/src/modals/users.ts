import mongoose from "mongoose";
import { Password } from "../services/password";

interface UserAttrs {
  email: String;
  password: String;
}

/**
 * An interface that describes what properties that a user modal has
 */
interface UserDoc extends mongoose.Document {
  email: String;
  password: String;
  createdAt: String;
  updatedAt: String;
}

/**
 * An interface that describes what properties thata a user property has
 */
interface UserModal extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.pre('save', async function(done) {
  if (this.isModified('password')) {
    const hashedPw = await Password.toHash(this.get('password'));
    this.set('password', hashedPw);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModal>('User', userSchema);

export default User


