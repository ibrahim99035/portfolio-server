const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const landingPagesController = require('../controllers/landingPagesController');

const router = express.Router();

/**
 * @swagger
 * /api/landing-pages:
 *   get:
 *     summary: Get all landing pages
 *     tags: [LandingPages]
 *     parameters:
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *     responses:
 *       200:
 *         description: List of landing pages
 */
router.get('/', optionalAuth, landingPagesController.getAllLandingPages);

/**
 * @swagger
 * /api/landing-pages/{id}:
 *   get:
 *     summary: Get landing page by ID
 *     tags: [LandingPages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Landing page object
 */
router.get('/:id', landingPagesController.getLandingPageById);

/**
 * @swagger
 * /api/landing-pages:
 *   post:
 *     summary: Create a new landing page
 *     tags: [LandingPages]
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
 *               liveUrl: { type: string }
 *               codeUrl: { type: string }
 *               tech: { type: string }
 *               color: { type: string }
 *               bgGradient: { type: string }
 *               featured: { type: boolean }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Landing page created
 */
router.post('/', authenticate, upload.single('image'), landingPagesController.createLandingPage);

/**
 * @swagger
 * /api/landing-pages/{id}:
 *   put:
 *     summary: Update a landing page
 *     tags: [LandingPages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               liveUrl: { type: string }
 *               codeUrl: { type: string }
 *               tech: { type: string }
 *               color: { type: string }
 *               bgGradient: { type: string }
 *               featured: { type: boolean }
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Landing page updated
 */
router.put('/:id', authenticate, upload.single('image'), landingPagesController.updateLandingPage);

/**
 * @swagger
 * /api/landing-pages/{id}:
 *   delete:
 *     summary: Delete a landing page
 *     tags: [LandingPages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Landing page deleted
 */
router.delete('/:id', authenticate, landingPagesController.deleteLandingPage);

/**
 * @swagger
 * /api/landing-pages/{id}/toggle-featured:
 *   put:
 *     summary: Toggle featured status
 *     tags: [LandingPages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Featured status toggled
 */
router.put('/:id/toggle-featured', authenticate, landingPagesController.toggleFeaturedLandingPage);

module.exports = router;