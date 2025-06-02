const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dictionaryRoutes = require('./server/routes/allRoutes');

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/', dictionaryRoutes);

mongoose.connect('mongodb://localhost:27017/cm-manik-saha')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

module.exports = app;