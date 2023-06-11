import express from 'express';
import {
   getAllCourses,
   createCourse,
   getCourseLectures,
   addLectures,
   deleteCourse,
   deleteLecture,
} from '../Controllers/courseControler.js';
import singleUpload from '../Middleware/multer.js';
import {
   authrizeAdmin,
   authrizeSubcriber,
   isAuthenticated,
} from '../Middleware/auth.js';

const router = express.Router();

//Get All courses without Lectures
router.route('/course').get(getAllCourses);

// Create new course - only Admin
router
   .route('/createcourse')
   .post(isAuthenticated, authrizeAdmin, singleUpload, createCourse);

router
   .route('/course/:id')
   .get(isAuthenticated, authrizeSubcriber, getCourseLectures)
   .post(isAuthenticated, authrizeAdmin, singleUpload, addLectures)
   .delete(isAuthenticated, authrizeAdmin, deleteCourse);

//Delete Lectures
router.route('/lecture').delete(isAuthenticated, authrizeAdmin, deleteLecture);

//Get Course Detailes

export default router;
