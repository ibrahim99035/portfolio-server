const { Certificate } = require('../models');
const { deleteFromCloudinary, extractPublicId, extractSecureUrl } = require('../config/cloudinary');

exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

exports.getCertificateById = async (req, res) => {
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
};

exports.createCertificate = async (req, res) => {
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
    if (req.file) {
      certificateData.cloudinaryUrl = extractSecureUrl(req.file);
      certificateData.cloudinaryPublicId = extractPublicId(req.file);
    }
    const certificate = new Certificate(certificateData);
    await certificate.save();
    res.status(201).json(certificate);
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ error: 'Failed to create certificate' });
  }
};

exports.updateCertificate = async (req, res) => {
  try {
    const { label, type, base } = req.body;
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    if (label) certificate.label = label;
    if (type) certificate.type = type;
    if (base) certificate.base = base;
    if (req.file) {
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
    res.json(certificate);
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
};

exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    if (certificate.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(certificate.cloudinaryPublicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
};