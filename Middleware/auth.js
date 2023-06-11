import Jwt from 'jsonwebtoken';
import { catchAsyncError } from './catchAsynError.js';
import { User } from '../Models/User.js';
import ErrorHandler from '../Utils/errorHandler.js';

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
   const { token } = req.cookies;

   if (!token) return next(new ErrorHandler('You are not logged in', 401));

   const decoded = Jwt.verify(token, process.env.JWT_SECRET);

   req.user = await User.findById(decoded._id);
   next();
});

export const authrizeAdmin = (req, res, next) => {
   if (req.user.role !== 'admin') {
      return next(new ErrorHandler('You are not authorized', 403));
   }
   next();
};

export const authrizeSubcriber = (req, res, next) => {
   if (req.user.subscription.status !== 'active' && req.user.role !== 'admin') {
      return next(
         new ErrorHandler('Only Subscribers can access this resource', 403)
      );
   }
   next();
};
