// server.js (simplified)

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const exportRoutes = require('./routes/export');

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api', exportRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SyncDoc backend running on port ${PORT}`);
});