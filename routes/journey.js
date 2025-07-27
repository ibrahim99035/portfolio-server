const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const journeyController = require('../controllers/journeyController');

const router = express.Router();

/**
 * @swagger
 * /api/journey:
 *   get:
 *     summary: Get all journey steps
 *     tags: [Journey]
 *     responses:
 *       200:
 *         description: List of journey steps
 */
router.get('/', optionalAuth, journeyController.getAllJourneySteps);

/**
 * @swagger
 * /api/journey/{id}:
 *   get:
 *     summary: Get journey step by ID
 *     tags: [Journey]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Journey step object
 */
router.get('/:id', journeyController.getJourneyStepById);

/**
 * @swagger
 * /api/journey:
 *   post:
 *     summary: Create a new journey step
 *     tags: [Journey]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year: { type: string }
 *               title: { type: string }
 *               description: { type: string }
 *               icon: { type: string }
 *               color: { type: string }
 *               order: { type: number }
 *     responses:
 *       201:
 *         description: Journey step created
 */
router.post('/', authenticate, journeyController.createJourneyStep);

/**
 * @swagger
 * /api/journey/{id}:
 *   put:
 *     summary: Update a journey step
 *     tags: [Journey]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year: { type: string }
 *               title: { type: string }
 *               description: { type: string }
 *               icon: { type: string }
 *               color: { type: string }
 *               order: { type: number }
 *     responses:
 *       200:
 *         description: Journey step updated
 */
router.put('/:id', authenticate, journeyController.updateJourneyStep);

/**
 * @swagger
 * /api/journey/{id}:
 *   delete:
 *     summary: Delete a journey step
 *     tags: [Journey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Journey step deleted
 */
router.delete('/:id', authenticate, journeyController.deleteJourneyStep);

/**
 * @swagger
 * /api/journey/reorder:
 *   put:
 *     summary: Reorder journey steps
 *     tags: [Journey]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     order: { type: number }
 *     responses:
 *       200:
 *         description: Journey steps reordered
 */
router.put('/reorder', authenticate, journeyController.reorderJourneySteps);

module.exports = router;