import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import workRoutes from './routes/work.routes.js';
import gradeRoutes from './routes/grade.routes.js';
import plagiarismReportRoutes from './routes/plagiarismReport.routes.js';
import aiReportRoutes from './routes/aiReport.routes.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/works', workRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/plagiarism-reports', plagiarismReportRoutes);
app.use('/api/ai-reports', aiReportRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
