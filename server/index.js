const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects'); // ✅ add
const taskRoutes = require('./routes/tasks');       // ✅ add

const app = express();

// CORS: restrict to the configured frontend origin when CORS_ORIGIN is set,
// otherwise allow all origins (dev convenience).
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors(
    corsOrigin
      ? { origin: corsOrigin.split(',').map((o) => o.trim()) }
      : undefined
  )
);
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes); // ✅ add
app.use('/api/tasks', taskRoutes);       // ✅ add

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
