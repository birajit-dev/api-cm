const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  qr_code: {
    type: String,
    required: true,
    trim: true
  },
  permalink: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  eventType: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      caption: {
        type: String
      }
    }
  ]
}, {
  timestamps: true
});

// Limit images array to 100
photoSchema.pre('validate', function(next) {
  if (this.images && this.images.length > 100) {
    this.invalidate('images', 'You can upload up to 100 images per photo title.');
  }
  next();
});

// Generate permalink from title if not provided
photoSchema.pre('validate', function(next) {
  if (!this.permalink && this.title) {
    this.permalink = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except space and hyphen
      .trim()
      .replace(/\s+/g, '-')         // replace spaces with hyphens
      .replace(/-+/g, '-');         // collapse multiple hyphens
  }
  next();
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;

