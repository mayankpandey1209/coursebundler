import { catchAsyncError } from '../Middleware/catchAsynError.js';
import ErrorHandler from '../Utils/errorHandler.js';
import { User } from '../Models/User.js';
import { sendToken } from '../Utils/sendToken.js';
import { sendEmail } from '../Utils/sendEmail.js';
import crypto from 'crypto';
import { Course } from '../Models/Course.js';
import cloudinary from 'cloudinary';
import getDataUri from '../Utils/dataUri.js';
import { Stats } from '../Models/Stats.js';
//Register New Users
export const register = catchAsyncError(async (req, res, next) => {
   const { name, email, password } = req.body;

   const file = req.file;

   if (!name || !email || !password || !file)
      return next(new ErrorHandler('All fields are required', 400));

   let user = await User.findOne({ email });
   if (user) return next(new ErrorHandler('User already exists', 409));

   //Upload file on cloudinary
   const fileUri = getDataUri(file);
   const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

   user = await User.create({
      name,
      email,
      password,
      avatar: {
         public_id: myCloud.public_id,
         url: myCloud.secure_url,
      },
   });
   sendToken(res, user, 'Resgister Successfully', 201);
});

//Login for Exsting User

export const login = catchAsyncError(async (req, res, next) => {
   const { email, password } = req.body;
   // const file = req.file;
   if (!email || !password)
      return next(new ErrorHandler('All fields are required', 400));

   const user = await User.findOne({ email }).select('+password');
   if (!user) return next(new ErrorHandler('Incorrect email or Password', 401));

   //Upload file on cloudinary
   const isMatch = await user.matchPassword(password);
   if (!isMatch)
      return next(new ErrorHandler('Incorrect emaail or Password', 401));
   sendToken(res, user, `Welcome back, ${user.name}`, 201);
});

//Logout User
export const logout = catchAsyncError(async (req, res, next) => {
   res.status(200)
      .cookie('token', null, {
         expires: new Date(Date.now()),
      })
      .json({
         success: true,
         message: 'Logged out successfully',
      });
});

//Get My Profile

export const getMyProfile = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);
   res.status(200).json({
      success: true,
      user,
   });
});

//Change Password

export const ChangePassword = catchAsyncError(async (req, res, next) => {
   const { currentPassword, newPassword } = req.body;
   if (!currentPassword || !newPassword)
      return next(new ErrorHandler('All fields are required', 400));

   const user = await User.findById(req.user._id).select('+password');
   const isMatch = await user.matchPassword(currentPassword);
   if (!isMatch)
      return next(new ErrorHandler('Incorrect current password', 401));

   user.password = newPassword;
   await user.save();
   res.status(200).json({
      success: true,
      message: 'Password changed successfully',
   });
});

//Update Profile

export const updateProfile = catchAsyncError(async (req, res, next) => {
   const { name, email } = req.body;

   const user = await User.findById(req.user._id);
   if (name) user.name = name;
   if (email) user.email = email;

   await user.save();
   res.status(200).json({
      success: true,
      message: 'Updated Profile successfully',
   });
});

//Update Profile Picture

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
   const file = req.file;

   const user = await User.findById(req.user._id);

   //Upload Picture in Cloudnairy
   const fileUri = getDataUri(file);

   const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

   await cloudinary.v2.uploader.destroy(user.avatar.public_id);

   user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
   };

   await user.save();

   res.status(200).json({
      success: true,
      message: 'Updated Profile Picture successfully',
   });
});

// Forget Password

export const forgetPassword = catchAsyncError(async (req, res, next) => {
   const { email } = req.body;
   const user = await User.findOne({ email });
   if (!user) return next(new ErrorHandler('User not found', 404));

   const resetToken = user.getResetPasswordToken();
   await user.save();
   const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

   const message = `Click on the link below to reset your password. ${url} \nIf you did not request this, please ignore this email.`;

   // Send the token to the user email
   await sendEmail(user.email, 'CourseBundler Reset Password', message);

   res.status(200).json({
      success: true,
      message: `Reset Token has been send to ${user.email} successfully`,
   });
});

// Reset Password
export const resetPassword = catchAsyncError(async (req, res, next) => {
   const { token } = req.params;
   const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

   const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
   });
   if (!user)
      return next(new ErrorHandler('Invalid Token or has been expired', 400));

   user.password = req.body.password;
   user.resetPasswordToken = undefined;
   user.resetPasswordExpire = undefined;

   await user.save();

   res.status(200).json({
      success: true,
      message: 'Reset Password successfully',
   });
});

export const addToPlaylist = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);

   const course = await Course.findById(req.body.id);
   if (!course) return next(new ErrorHandler('Course not found', 404));

   const itemExist = user.playlist.find((item) => {
      if (item.course.toString() === course._id.toString()) return true;
   });

   if (itemExist) return next(new ErrorHandler('Course already exists', 409));

   user.playlist.push({
      course: course._id,
      poster: course.poster.url,
   });

   await user.save();

   res.status(200).json({
      success: true,
      message: 'Added to playlist successfully',
   });
});

export const deleteFromPlaylist = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);

   const course = await Course.findById(req.query.id);
   if (!course) return next(new ErrorHandler('Course not found', 404));

   const newPlaylist = user.playlist.filter((item) => {
      if (item.course.toString() !== course._id.toString()) return item;
   });

   user.playlist = newPlaylist;

   await user.save();

   res.status(200).json({
      success: true,
      message: 'Remove from Playlist',
   });
});

// Admin Controller

export const getAllUsers = catchAsyncError(async (req, res, next) => {
   const users = await User.find();
   res.status(200).json({
      success: true,
      users,
   });
});

export const updateUserRole = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.params.id);
   if (!user) return next(new ErrorHandler('User not found', 404));
   if (user.role === 'user') {
      user.role = 'admin';
   } else {
      user.role = 'user';
   }
   await user.save();
   res.status(200).json({
      success: true,
      message: 'Role updated successfully',
   });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.params.id);
   if (!user) return next(new ErrorHandler('User not found', 404));

   await cloudinary.v2.uploader.destroy(user.avatar.public_id);
   // Cancel Subscription

   await user.deleteOne();
   res.status(200)
      .cookie('token', null, {
         expires: new Date(Date.now()),
      })
      .json({
         success: true,
         message: 'User Deleted Successfully',
      });
});

// Delete Profile
export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);

   await cloudinary.v2.uploader.destroy(user.avatar.public_id);
   // Cancel Subscription

   await user.deleteOne();
   res.status(200)
      .cookie('token', null, {
         expires: new Date(Date.now()),
      })
      .json({
         success: true,
         message: 'User Deleted successfully',
      });
});

// User.watch().on('change', async () => {
//    const stats = await Stats.find({}).sort({ createdAt: 'desc' }).limit(1);

//    const subscription = await User.find({ 'subscription.status': 'active' });
//    const userCount = await User.countDocuments();
//    stats[0].users = userCount;
//    stats[0].subscription = subscription.length;
//    stats[0].createdAt = new Date(Date.now());

//    await stats[0].save();
// });
User.watch().on('change', async () => {
   const subscriptionCount = await User.countDocuments({
      'subscription.status': 'active',
   });
   const userCount = await User.countDocuments();

   const stats = new Stats({
      users: userCount,
      subscription: subscriptionCount,
      createdAt: new Date(Date.now()),
   });

   await stats.save();
});
