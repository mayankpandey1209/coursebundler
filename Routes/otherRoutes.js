import express from 'express';
import { authrizeAdmin, isAuthenticated } from '../Middleware/auth.js';
import { contact, courseRequest, getDashboardStats } from '../Controllers/otherControlers.js';

const router = express.Router();

// Contact Form
router.route('/contact').post(contact);

// Request Form
router.route('/courserequest').post(courseRequest);

// Get Admin Dashboard Stats
router
   .route('/admin/stats')
   .get(isAuthenticated, authrizeAdmin, getDashboardStats);

export default router;
