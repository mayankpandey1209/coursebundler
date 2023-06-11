import express from 'express';
import {
   ChangePassword,
   addToPlaylist,
   deleteFromPlaylist,
   deleteMyProfile,
   deleteUser,
   forgetPassword,
   getAllUsers,
   getMyProfile,
   login,
   logout,
   register,
   resetPassword,
   updateProfile,
   updateProfilePicture,
   updateUserRole,
} from '../Controllers/userControler.js';
import { authrizeAdmin, isAuthenticated } from '../Middleware/auth.js';
import singleUpload from '../Middleware/multer.js';

const router = express.Router();

// router.route('/user').get(getAllUsers);

//To get new User registration
router.route('/register').post(singleUpload, register);

//Login
router.route('/login').post(login);
// Logout
router.route('/logout').get(logout);
//get my profile
router.route('/me').get(isAuthenticated, getMyProfile);

//Change Password
router.route('/changepassword').put(isAuthenticated, ChangePassword);
//Update Profile
router
   .route('/updateprofile')
   .put(isAuthenticated, singleUpload, updateProfile);

//Update Profile Picture
router
   .route('/updateprofilepicture')
   .put(isAuthenticated, singleUpload, updateProfilePicture);

//ForgetPassword
router.route('/forgetpassword').post(forgetPassword);
//reset Password
router.route('/resetpassword/:token').put(resetPassword);

//Add to playlist

router.route('/addtoplaylist').post(isAuthenticated, addToPlaylist);
//Remove from Playlist
router.route('/deletefromplaylist').delete(isAuthenticated, deleteFromPlaylist);

//Admin Route
router.route('/admin/users').get(isAuthenticated, authrizeAdmin, getAllUsers);

//Admin Role Update
router
   .route('/admin/user/:id')
   .put(isAuthenticated, authrizeAdmin, updateUserRole).delete(isAuthenticated, authrizeAdmin, deleteUser); 
// delete myprofile
router.route('/me').delete(isAuthenticated, deleteMyProfile);

export default router;
