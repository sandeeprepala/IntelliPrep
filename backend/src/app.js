import express from 'express';
// import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
// app.use(cors());
import cors from "cors";

app.use(cors({
  origin: "*", // your frontend port
  credentials: true               // ✅ allow sending cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser()); // Middleware to parse cookies


// Import routes
import userRouter from './Routes/userRoute.js';
import resourcesRouter from './Routes/resourcesRoute.js';
import resumeJDRouter from './Routes/resumejdRoute.js';
import interviewRouter from './Routes/interviewRoute.js';
import mockRouter from './Routes/mockinterviewRoute.js';
import viewPreviousAnalysisRouter from './Routes/viewPreviousAnalysisRoute.js';
import mockTestRouter from './Routes/mockTestRoute.js';
import roadmapRoute from './Routes/roadmapsRoute.js';


// Use routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/resources', resourcesRouter);
app.use('/api/v1/resume', resumeJDRouter);
app.use('/api/v1/interviews', interviewRouter);
app.use('/api/v1/mock-interviews', mockRouter);
app.use('/api/v1/previous-analysis', viewPreviousAnalysisRouter);
app.use('/api/v1/mock-test', mockTestRouter);
app.use('/api/v1/roadmaps',roadmapRoute);


export { app };