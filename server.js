import app from './App.js';
import { connectDB } from './Config/dataBase.js';
import cloudinary from 'cloudinary';
import Razorpay from 'razorpay';
import nodeCron from 'node-cron';
import { Stats } from './Models/Stats.js';

connectDB();

cloudinary.v2.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Integration of Razorpay
export const instance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID,
   key_secret: process.env.RAZORPAY_SECRET_ID,
});

nodeCron.schedule('0 0 0 1 * *', async () => {
   try {
      await Stats.create({});
   } catch (error) {
      console.log(error);
   }
});

app.listen(process.env.PORT, () => {
   console.log(`Server is running on port: ${process.env.PORT}`);
});
