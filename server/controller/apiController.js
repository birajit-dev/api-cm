const Slider = require('../model/sliderModel');
const Press = require('../model/pressModel');
const Photo = require('../model/photoModel');
const QRCode = require('qrcode');

const path = require('path');
const fs = require('fs');

// Multer setup for file upload
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/slider');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

exports.upload = multer({ storage: storage });

// Controller to create a new slider with image upload
exports.createSlider = async (req, res) => {
  try {
    const { title, subtitle, link, order, isActive } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/slider/${req.file.filename}`;
    }

    const slider = new Slider({
      title,
      subtitle,
      imageUrl,
      link,
      order,
      isActive
    });

    await slider.save();
    res.status(201).json({ message: 'Slider created successfully', slider });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create slider', error: error.message });
  }
};

// Controller to get all sliders
exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json(sliders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sliders', error: error.message });
  }
};

// Controller to get a single slider by ID
exports.getSliderById = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }
    res.status(200).json(slider);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch slider', error: error.message });
  }
};

// Controller to update a slider (with optional image update)
exports.updateSlider = async (req, res) => {
  try {
    const { title, subtitle, link, order, isActive } = req.body;
    let updateData = { title, subtitle, link, order, isActive };

    if (req.file) {
      updateData.imageUrl = `/uploads/slider/${req.file.filename}`;
    }

    const slider = await Slider.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    res.status(200).json({ message: 'Slider updated successfully', slider });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update slider', error: error.message });
  }
};

// Controller to delete a slider
exports.deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }
    // Optionally, delete the image file
    if (slider.imageUrl) {
      const imagePath = path.join(__dirname, '../../', slider.imageUrl);
      fs.unlink(imagePath, (err) => { /* ignore error */ });
    }
    res.status(200).json({ message: 'Slider deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete slider', error: error.message });
  }
};




// Multer setup for file upload (for press thumbnails)
const pressStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/press');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

exports.pressUpload = multer({ storage: pressStorage });

// Controller to create a new press release
exports.createPress = async (req, res) => {
  try {
    const {
      title,
      date,
      content,
      source,
      author,
      tags,
      link: reqLink,
      isActive
    } = req.body;

    let thumbnail = null;
    if (req.file) {
      thumbnail = `/uploads/press/${req.file.filename}`;
    } else if (req.body.thumbnail) {
      thumbnail = req.body.thumbnail;
    }

    // tags can be sent as a comma-separated string or array
    let tagsArray = [];
    if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (Array.isArray(tags)) {
      tagsArray = tags;
    }

    // Generate link from title if not provided
    let generatedLink = reqLink;
    if (!generatedLink && title) {
      generatedLink = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except space and hyphen
        .trim()
        .replace(/\s+/g, '-')         // replace spaces with hyphens
        .replace(/-+/g, '-');         // collapse multiple hyphens
    }

    const press = new Press({
      title,
      date,
      thumbnail,
      content,
      source,
      author,
      tags: tagsArray,
      link: generatedLink,
      isActive
    });

    await press.save();
    res.status(201).json({ message: 'Press release created successfully', press });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create press release', error: error.message });
  }
};
// Controller to get all press releases
exports.getAllPress = async (req, res) => {
  try {
    // Optionally, filter by isActive or other query params
    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    const pressList = await Press.find(filter).sort({ date: -1, createdAt: -1 });
    res.status(200).json(pressList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch press releases', error: error.message });
  }
};

// Controller to get a single press release by ID
exports.getPressById = async (req, res) => {
  try {
    const press = await Press.findById(req.params.id);
    if (!press) {
      return res.status(404).json({ message: 'Press release not found' });
    }
    res.status(200).json(press);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch press release', error: error.message });
  }
};

// Controller to update a press release (with optional thumbnail update)
exports.updatePress = async (req, res) => {
  try {
    const {
      title,
      date,
      content,
      source,
      author,
      tags,
      link,
      isActive
    } = req.body;

    let updateData = {
      title,
      date,
      content,
      source,
      author,
      link,
      isActive
    };

    // tags can be sent as a comma-separated string or array
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        updateData.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        updateData.tags = tags;
      }
    }

    if (req.file) {
      updateData.thumbnail = `/uploads/press/${req.file.filename}`;
    } else if (req.body.thumbnail) {
      updateData.thumbnail = req.body.thumbnail;
    }

    const press = await Press.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!press) {
      return res.status(404).json({ message: 'Press release not found' });
    }

    res.status(200).json({ message: 'Press release updated successfully', press });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update press release', error: error.message });
  }
};

// Controller to delete a press release
exports.deletePress = async (req, res) => {
  try {
    const press = await Press.findByIdAndDelete(req.params.id);
    if (!press) {
      return res.status(404).json({ message: 'Press release not found' });
    }
    // Optionally, delete the thumbnail file
    if (press.thumbnail) {
      const imagePath = path.join(__dirname, '../../', press.thumbnail);
      fs.unlink(imagePath, (err) => { /* ignore error */ });
    }
    res.status(200).json({ message: 'Press release deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete press release', error: error.message });
  }
};




// Multer setup for multiple photo images upload
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/photos');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Use .array('images', 100) for up to 100 images per event
exports.photoUpload = multer({ storage: photoStorage }).array('images', 100);

// Controller to create a new photo event with multiple images

exports.createPhoto = async (req, res) => {
  try {
    const { title, permalink, eventType, date } = req.body;
    let images = [];

    // req.files is always an array when using .array()
    if (req.files && Array.isArray(req.files)) {
      // captions can be a string, array, or undefined
      let captions = req.body.captions;
      if (Array.isArray(captions)) {
        // If captions is an array, match each caption to each file
        images = req.files.map((file, idx) => ({
          url: `/uploads/photos/${file.filename}`,
          caption: captions[idx] || ''
        }));
      } else if (typeof captions === 'string') {
        // If captions is a single string, apply to all images
        images = req.files.map(file => ({
          url: `/uploads/photos/${file.filename}`,
          caption: captions
        }));
      } else {
        // No captions provided
        images = req.files.map(file => ({
          url: `/uploads/photos/${file.filename}`,
          caption: ''
        }));
      }
    }

    // Generate QR code for the photo event link
    // The QR code will be returned in the response so the client can display or share it as needed.
    const domain = 'https://domain.com';
    const photoLink = `${domain}/photoGallery/${permalink || ''}`;
    // Generate QR code as a data URL (base64 PNG)
    const qr_code = await QRCode.toDataURL(photoLink);

    const photo = new Photo({
      title,
      permalink,
      eventType,
      date,
      images,
      qr_code
    });

    await photo.save();

    // Return the photo object and the QR code in the response so the client can decide where/how to display or share it.
    res.status(201).json({ 
      message: 'Photo event created successfully', 
      photo,
      qr_code_location: 'Returned in response as qr_code property. Client can display or share as needed.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create photo event', error: error.message });
  }
};

// Controller to get all photo events
exports.getAllPhotos = async (req, res) => {
  try {
    const photos = await Photo.find().sort({ date: -1, createdAt: -1 });
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch photo events', error: error.message });
  }
};

// Controller to get a single photo event by ID
exports.getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo event not found' });
    }
    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch photo event', error: error.message });
  }
};

// Controller to update a photo event (including images)
exports.updatePhoto = async (req, res) => {
  try {
    const { title, permalink, eventType, date } = req.body;
    let updateData = { title, permalink, eventType, date };

    // Handle new image uploads
    let newImages = [];
    if (req.files && Array.isArray(req.files)) {
      newImages = req.files.map(file => ({
        url: `/uploads/photos/${file.filename}`,
        caption: (req.body.captions && Array.isArray(req.body.captions))
          ? req.body.captions[req.files.indexOf(file)] || ''
          : ''
      }));
    } else if (req.files && typeof req.files === 'object') {
      if (req.files.images) {
        newImages = req.files.images.map((file, idx) => ({
          url: `/uploads/photos/${file.filename}`,
          caption: (req.body.captions && Array.isArray(req.body.captions))
            ? req.body.captions[idx] || ''
            : ''
        }));
      }
    }

    // If captions is a single string, apply to all new images
    if (req.body.captions && typeof req.body.captions === 'string' && newImages.length > 0) {
      newImages = newImages.map(img => ({
        ...img,
        caption: req.body.captions
      }));
    }

    // Optionally, merge with existing images if provided
    if (req.body.existingImages && Array.isArray(req.body.existingImages)) {
      updateData.images = [...req.body.existingImages, ...newImages];
    } else if (newImages.length > 0) {
      updateData.images = newImages;
    }

    const photo = await Photo.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!photo) {
      return res.status(404).json({ message: 'Photo event not found' });
    }

    res.status(200).json({ message: 'Photo event updated successfully', photo });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update photo event', error: error.message });
  }
};

// Controller to delete a photo event
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo event not found' });
    }
    // Optionally, delete the image files
    if (photo.images && Array.isArray(photo.images)) {
      photo.images.forEach(img => {
        if (img.url) {
          const imagePath = path.join(__dirname, '../../', img.url);
          fs.unlink(imagePath, (err) => { /* ignore error */ });
        }
      });
    }
    res.status(200).json({ message: 'Photo event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete photo event', error: error.message });
  }
};
