const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const imagesController = require('../controllers/imagesController');

const router = express.Router();

/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: Get all images
 *     tags: [Images]
 *     responses:
 *       200:
 *         description: List of images
 */
router.get('/', optionalAuth, imagesController.getAllImages);

/**
 * @swagger
 * /api/images/stations:
 *   get:
 *     summary: Get unique image stations
 *     tags: [Images]
 *     responses:
 *       200:
 *         description: List of stations
 */
router.get('/stations', imagesController.getStations);

/**
 * @swagger
 * /api/images/{id}:
 *   get:
 *     summary: Get image by ID
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Image object
 */
router.get('/:id', imagesController.getImageById);

/**
 * @swagger
 * /api/images:
 *   post:
 *     summary: Create a new image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               station: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Image created
 */
router.post('/', authenticate, upload.single('image'), imagesController.createImage);

/**
 * @swagger
 * /api/images/{id}:
 *   put:
 *     summary: Update an image
 *     tags: [Images]
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
 *               title: { type: string }
 *               description: { type: string }
 *               station: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Image updated
 */
router.put('/:id', authenticate, upload.single('image'), imagesController.updateImage);

/**
 * @swagger
 * /api/images/{id}:
 *   delete:
 *     summary: Delete an image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Image deleted
 */
router.delete('/:id', authenticate, imagesController.deleteImage);

module.exports = router;