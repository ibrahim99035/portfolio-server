const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const certificatesController = require('../controllers/certificatesController');

const router = express.Router();

/**
 * @swagger
 * /api/certificates:
 *   get:
 *     summary: Get all certificates
 *     tags: [Certificates]
 *     responses:
 *       200:
 *         description: List of certificates
 */
router.get('/', optionalAuth, certificatesController.getAllCertificates);

/**
 * @swagger
 * /api/certificates/{id}:
 *   get:
 *     summary: Get certificate by ID
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Certificate object
 */
router.get('/:id', certificatesController.getCertificateById);

/**
 * @swagger
 * /api/certificates:
 *   post:
 *     summary: Create a new certificate
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               label: { type: string }
 *               type: { type: string }
 *               base: { type: string }
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Certificate created
 */
router.post('/', authenticate, upload.single('file'), certificatesController.createCertificate);

/**
 * @swagger
 * /api/certificates/{id}:
 *   put:
 *     summary: Update a certificate
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               label: { type: string }
 *               type: { type: string }
 *               base: { type: string }
 *               file: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Certificate updated
 */
router.put('/:id', authenticate, upload.single('file'), certificatesController.updateCertificate);

/**
 * @swagger
 * /api/certificates/{id}:
 *   delete:
 *     summary: Delete a certificate
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Certificate deleted
 */
router.delete('/:id', authenticate, certificatesController.deleteCertificate);

module.exports = router;