const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const personalInfoController = require('../controllers/personalInfoController');

const router = express.Router();

/**
 * @swagger
 * /api/personal-info:
 *   get:
 *     summary: Get all personal projects
 *     tags: [PersonalInfo]
 *     responses:
 *       200:
 *         description: List of personal projects
 */
router.get('/', optionalAuth, personalInfoController.getAllPersonalProjects);

/**
 * @swagger
 * /api/personal-info/statuses:
 *   get:
 *     summary: Get unique project statuses
 *     tags: [PersonalInfo]
 *     responses:
 *       200:
 *         description: List of statuses
 */
router.get('/statuses', personalInfoController.getStatuses);

/**
 * @swagger
 * /api/personal-info/{id}:
 *   get:
 *     summary: Get personal project by ID
 *     tags: [PersonalInfo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Personal project object
 */
router.get('/:id', personalInfoController.getPersonalProjectById);

/**
 * @swagger
 * /api/personal-info:
 *   post:
 *     summary: Create a new personal project
 *     tags: [PersonalInfo]
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
 *               status: { type: string }
 *               link: { type: string }
 *               featured: { type: boolean }
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201:
 *         description: Personal project created
 */
router.post('/', authenticate, upload.array('images', 5), personalInfoController.createPersonalProject);

/**
 * @swagger
 * /api/personal-info/{id}:
 *   put:
 *     summary: Update a personal project
 *     tags: [PersonalInfo]
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
 *               status: { type: string }
 *               link: { type: string }
 *               featured: { type: boolean }
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       200:
 *         description: Personal project updated
 */
router.put('/:id', authenticate, upload.array('images', 5), personalInfoController.updatePersonalProject);

/**
 * @swagger
 * /api/personal-info/{id}:
 *   delete:
 *     summary: Delete a personal project
 *     tags: [PersonalInfo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Personal project deleted
 */
router.delete('/:id', authenticate, personalInfoController.deletePersonalProject);

/**
 * @swagger
 * /api/personal-info/{id}/toggle-featured:
 *   put:
 *     summary: Toggle featured status
 *     tags: [PersonalInfo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Featured status toggled
 */
router.put('/:id/toggle-featured', authenticate, personalInfoController.toggleFeaturedPersonalProject);

module.exports = router;