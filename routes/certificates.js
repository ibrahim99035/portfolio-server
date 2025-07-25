const express = require('express');
const { Certificate } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { cache } = require('../config/redis');
const { upload, deleteFromCloudinary, extractPublicId, extractSecureUrl } = require('../config/cloudinary');

const router = express.Router();

// GET /api/certificates - Get all certificates (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const cacheKey = 'certificates:all';
    
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const certificates = await Certificate.find().sort({ createdAt: -1 });
    
    // Cache the result
    await cache.set(cacheKey, certificates);
    
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// GET /api/certificates/:id - Get specific certificate
router.get('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    res.json(certificate);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// POST /api/certificates - Create new certificate (protected)
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { label, type, base } = req.body;

    if (!label || !type || !base) {
      return res.status(400).json({ error: 'Label, type, and base are required' });
    }

    const certificateData = {
      label,
      type,
      base,
      file: req.file ? req.file.originalname : base + '.pdf'
    };

    // If file was uploaded to Cloudinary
    if (req.file) {
      certificateData.cloudinaryUrl = extractSecureUrl(req.file);
      certificateData.cloudinaryPublicId = extractPublicId(req.file);
    }

    const certificate = new Certificate(certificateData);
    await certificate.save();

    // Clear cache
    await cache.del('certificates:all');

    res.status(201).json(certificate);
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

// PUT /api/certificates/:id - Update certificate (protected)
router.put('/:id', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { label, type, base } = req.body;
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Update fields
    if (label) certificate.label = label;
    if (type) certificate.type = type;
    if (base) certificate.base = base;

    // If new file uploaded
    if (req.file) {
      // Delete old file from Cloudinary if exists
      if (certificate.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(certificate.cloudinaryPublicId);
        } catch (error) {
          console.error('Error deleting old file:', error);
        }
      }

      certificate.file = req.file.originalname;
      certificate.cloudinaryUrl = extractSecureUrl(req.file);
      certificate.cloudinaryPublicId = extractPublicId(req.file);
    }

    await certificate.save();

    // Clear cache
    await cache.del('certificates:all');

    res.json(certificate);
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

// DELETE /api/certificates/:id - Delete certificate (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Delete from Cloudinary if exists
    if (certificate.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(certificate.cloudinaryPublicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    await Certificate.findByIdAndDelete(req.params.id);

    // Clear cache
    await cache.del('certificates:all');

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

module.exports = router;