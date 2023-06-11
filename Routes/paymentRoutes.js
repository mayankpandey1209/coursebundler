import express from 'express';
import { isAuthenticated } from '../Middleware/auth.js';
import {
   buySubsription,
   cancelSubscription,
   getRazorPayKey,
   paymentVerification,
} from '../Controllers/paymentControler.js';

const router = express.Router();

// Buy Subscription
router.route('/subscribe').get(isAuthenticated, buySubsription);

// Payment Verification and save referance to database

router.route('/paymentverification').post(isAuthenticated, paymentVerification);
// Get razorpay key
router.route('/razorpaykey').get(isAuthenticated, getRazorPayKey);

//cancle subscription
router.route('/subscribe/cancel').delete(isAuthenticated, cancelSubscription);

export default router;
