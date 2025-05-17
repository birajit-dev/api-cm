const mongoose = require('mongoose');

// Helper to format date as "January 15, 2024"
function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const pressSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    get: formatDate,
    set: val => new Date(val)
  },
  thumbnail: {
    type: String, // URL or file path
    required: true
  },
  content: {
    type: String,
    required: true
  },
  source: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  link: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

const Press = mongoose.model('Press', pressSchema);

module.exports = Press;
