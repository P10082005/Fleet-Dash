require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const exportRoutes = require('./routes/export');

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use('/api', exportRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log('Server running');
});