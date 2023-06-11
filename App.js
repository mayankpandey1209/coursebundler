import express from 'express';
import { config } from 'dotenv';
import ErrorMiddleware from './Middleware/Error.js';
import cookieParser from 'cookie-parser';
import other from './Routes/otherRoutes.js';
import cors from 'cors';

config({
   path: './Config/config.env',
});
const app = express();

// Using Middleware
app.use(express.json());
app.use(
   express.urlencoded({
      extended: false,
   })
);
app.use(cookieParser());
app.use(
   cors({
      origin: process.env.FORNTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
   })
);
// Importing Routes and Controllers
import course from './Routes/courseRoutes.js';
import user from './Routes/userRoute.js';
import payment from './Routes/paymentRoutes.js';

app.use('/api/v1', course);
app.use('/api/v1', user);
app.use('/api/v1', payment);
app.use('/api/v1', other);

export default app;

app.get('/', (req, res) => {
   res.send(
      `<h1>Site Is Working. Click <a href= ${process.env.FORNTEND_URL}> here</a></h1>`
   );
});

app.use(ErrorMiddleware);
