import mongoose from 'mongoose';

const schema = new mongoose.Schema({
   razorpay_signature:{
    type:String,
    require:true,
   },
   razorpay_payment_id:{
    type:String,
    require:true,
   },
   razorpay_subscription_id:{
    type:String,
    require:true,
   },
   crearedAt: {
      type: Date,
      default: Date.now,
   },
});

export const Payment = mongoose.model('Payment', schema);
