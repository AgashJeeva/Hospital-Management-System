import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const email = 'agash@gmail.com';
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log(`User found: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password Hash in DB: ${user.password}`);
      
      const isMatch = await user.matchPassword('00000000');
      console.log(`Does '00000000' match? ${isMatch}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testLogin();
