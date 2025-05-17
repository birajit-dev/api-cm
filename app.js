const express = require('express');
const mongoose = require('mongoose');
const dictionaryRoutes = require('./server/routes/allRoutes');

const app = express();
app.use(express.json());

app.use('/api/v1/', dictionaryRoutes);

mongoose.connect('mongodb://localhost:27017/cm-manik-saha')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

module.exports = app;