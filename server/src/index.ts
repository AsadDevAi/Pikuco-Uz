import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('⚠️ Server startup warning (DB or ENV missing):', err);
    console.error('⚠️ Server will continue to listen to PORT to pass deployment health checks.');
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Fatal startup error:', err);
});
