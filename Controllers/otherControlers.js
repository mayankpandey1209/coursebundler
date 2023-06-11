import { catchAsyncError } from '../Middleware/catchAsynError.js';
import ErrorHandler from '../Utils/errorHandler.js';
import { sendEmail } from '../Utils/sendEmail.js';
import { Stats } from '../Models/Stats.js';

//This for contact form submiition
export const contact = catchAsyncError(async (req, res, next) => {
   const { name, email, message } = req.body;
   if (!name || !email || !message) {
      return next(new ErrorHandler('All fields are required', 400));
   }
   const to = process.env.EMAIL_ADDRESS;
   const subject = 'Contact Form';
   const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
   await sendEmail(to, subject, text);
   res.status(200).json({
      success: true,
      message: 'Your Message has been send successfully',
   });
});

export const courseRequest = catchAsyncError(async (req, res, next) => {
   const { name, email, course } = req.body;
   if (!name || !email || !course) {
      return next(new ErrorHandler('All fields are required', 400));
   }
   const to = process.env.EMAIL_ADDRESS;
   const subject = 'Requesting for a course';
   const text = `Name: ${name}\nEmail: ${email}\nMessage: ${course}`;
   await sendEmail(to, subject, text);
   res.status(200).json({
      success: true,
      message: 'Your Request has been send successfully',
   });

   res.status(200).json({
      success: true,
      message: 'Contact Form',
   });
});

export const getDashboardStats = catchAsyncError(async (req, res, next) => {
   const stats = await Stats.find({}).sort({ createdAt: 'desc' }).limit(12);

   const statsData = [];

   for (let i = 0; i < stats.length; i++) {
      statsData.unshift(stats[i]);
   }

   const requireSize = 12 - stats.length;

   for (let i = 0; i < requireSize; i++) {
      statsData.unshift({
         users: 0,

         views: 0,
         subscription: 0,
      });
   }
   const usersCount = statsData[11].users;
   const subscriptionCount = statsData[11].subscription;
   const viewsCount = statsData[11].views;

   let usersPercent = 0;
   let subscriptionPercent = 0;
   let viewsPercent = 0;

   let usersProfit = true;
   let subscriptionProfit = true;
   let viewsProfit = true;

   if (statsData[10].users === 0) {
      usersPercent = usersCount * 100;
   }

   if (statsData[10].views === 0) {
      viewsPercent = viewsCount * 100;
   }
   if (statsData[10].subscription === 0) {
      subscriptionPercent = subscriptionCount * 100;
   } else {
      const difference = {
         users: statsData[11].users - statsData[10].users,
         views: statsData[11].views - statsData[10].views,
         subscription: statsData[11].subscription - statsData[10].subscription,
      };
      usersPercent = (difference.users / statsData[10].users) * 100;
      viewsPercent = (difference.views / statsData[10].views) * 100;
      subscriptionPercent =
         (difference.subscription / statsData[10].subscription) * 100;
      if (usersPercent < 0) usersProfit = false;
      if (viewsPercent < 0) viewsProfit = false;
      if (subsriptionPercent < 0) subsriptionProfit = false;
   }

   res.status(200).json({
      success: true,
      stats: statsData,
      usersCount,
      subscriptionCount,
      viewsCount,
      usersPercent,
      subscriptionPercent,
      viewsPercent,
      usersProfit,
      subscriptionProfit,
      viewsProfit,
   });
});
