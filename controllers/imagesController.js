const { Image } = require('../models');
const { deleteFromCloudinary, extractPublicId, extractSecureUrl } = require('../config/cloudinary');

exports.getAllImages = async (req, res) => {
  try {
    const { station } = req.query;
    let query = {};
    if (station) query.station = station;
    const images = await Image.find(query).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
};

exports.getStations = async (req, res) => {
  try {
    const stations = await Image.distinct('station');
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
};

exports.getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
};

exports.createImage = async (req, res) => {
  try {
    const { title, description, station } = req.body;
    if (!title || !description || !station) {
      return res.status(400).json({ error: 'Title, description, and station are required' });
    }
    const imageData = {
      title,
      description,
      station,
      src: req.file ? '' : '/default-image.jpg'
    };
    if (req.file) {
      imageData.src = extractSecureUrl(req.file);
      imageData.cloudinaryUrl = extractSecureUrl(req.file);
      imageData.cloudinaryPublicId = extractPublicId(req.file);
    }
    const image = new Image(imageData);
    await image.save();
    res.status(201).json(image);
  } catch (error) {
    console.error('Error creating image:', error);
    res.status(500).json({ error: 'Failed to create image' });
  }
};

exports.updateImage = async (req, res) => {
  try {
    const { title, description, station } = req.body;
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    if (title) image.title = title;
    if (description) image.description = description;
    if (station) image.station = station;
    if (req.file) {
      if (image.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(image.cloudinaryPublicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      image.src = extractSecureUrl(req.file);
      image.cloudinaryUrl = extractSecureUrl(req.file);
      image.cloudinaryPublicId = extractPublicId(req.file);
    }
    await image.save();
    res.json(image);
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    if (image.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(image.cloudinaryPublicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }
    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};