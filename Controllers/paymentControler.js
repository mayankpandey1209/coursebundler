import { catchAsyncError } from '../Middleware/catchAsynError.js';
import { User } from '../Models/User.js';
import ErrorHandler from '../Utils/errorHandler.js';
import { instance } from '../server.js';
import crypto from 'crypto';
import { Payment } from '../Models/payment.js';

export const buySubsription = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);
   if (user.role === 'admin')
      return next(
         new ErrorHandler('You are not authorized to buy subscription', 400)
      );

   const plan_id = process.env.PLAN_ID || 'plan_LxuBkvVw51VFKj';
   const subscription = await instance.subscriptions.create({
      plan_id,
      customer_notify: 1,
      total_count: 12,
   });
   user.subscription.id = subscription.id;

   user.subscription.status = subscription.status;

   await user.save();

   res.status(201).json({
      success: true,
      subscriptionId: subscription.id,
   });
});

export const paymentVerification = catchAsyncError(async (req, res, next) => {
   const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } =
      req.body;
   const user = await User.findById(req.user._id);

   const subscrption_id = user.subscription.id;
   const genrated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_ID)
      .update(razorpay_payment_id + '|' + subscription_id, 'utf-8')
      .digest('hex');

   const isAutahentic = genrated_signature === razorpay_signature;

   if (!isAutahentic)
      return res.redirect(`${process.env.FORNTEND_URL}/paymentfailed`);

   // data Base comes here
   await Payment.create({
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id,
   });

   user.subscription.status = 'active';

   await user.save();

   res.redirect(
      `${process.env.FORNTEND_URL}/paymentsuccess?referance=${razorpay_payment_id}`
   );
});

export const getRazorPayKey = catchAsyncError(async (req, res, next) => {
   res.status(200).json({
      success: true,
      razorpay_key: process.env.RAZORPAY_KEY_ID,
   });
});

export const cancelSubscription = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);
   const subscriptionId = user.subscription.id;

   let refund = false;

   await instance.subscriptions.cancel(subscriptionId);

   const payment = await Payment.findOne({
      razorpay_subscription_id: subscriptionId,
   });
   const gap = Date.now() - payment.createdAt;

   const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

   if (gap < refundTime) {
      await instance.payments.refund(payment.razorpay_payment_id);
      refund = true;
   }

   await payment.remove();
   user.subscription.id = undefined;
   user.subscription.status = undefined;
   await user.save();

   res.status(200).json({
      success: true,
      message: refund
         ? 'Subscription Cancelled successfully.You will receive full refund with in 7 days.'
         : 'Subscription Cancelled successfully.Now refund initiated as subscription was cancelled after 7 days .',
   });
});
