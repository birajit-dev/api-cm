const express = require('express');
const router = express.Router();

const apiController = require('../controller/apiController');

// Slider routes with api/v1/ prefix
router.post('/sliders', apiController.upload.single('image'), apiController.createSlider);
router.get('/sliders', apiController.getAllSliders);
router.get('/sliders/:id', apiController.getSliderById);
router.put('/sliders/:id', apiController.upload.single('image'), apiController.updateSlider);
router.delete('/sliders/:id', apiController.deleteSlider);

// In the future, add other routes here
// Press routes with api/v1/ prefix
router.post('/press', apiController.pressUpload.single('thumbnail'), apiController.createPress);
router.get('/press', apiController.getAllPress);
router.get('/press/:id', apiController.getPressById);
router.put('/press/:id', apiController.pressUpload.single('thumbnail'), apiController.updatePress);
router.delete('/press/:id', apiController.deletePress);

// Photo routes with api/v1/ prefix
router.post('/photos', apiController.photoUpload, apiController.createPhoto);
router.get('/photos', apiController.getAllPhotos);
router.get('/photos/:id', apiController.getPhotoById);
router.put('/photos/:id', apiController.photoUpload, apiController.updatePhoto);
router.delete('/photos/:id', apiController.deletePhoto);





module.exports = router;

