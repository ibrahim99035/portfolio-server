const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const odooController = require('../controllers/odooController');

const router = express.Router();

/**
 * @swagger
 * /api/odoo:
 *   get:
 *     summary: Get all Odoo modules
 *     tags: [Odoo]
 *     responses:
 *       200:
 *         description: List of Odoo modules
 */
router.get('/', optionalAuth, odooController.getAllOdooModules);

/**
 * @swagger
 * /api/odoo/categories:
 *   get:
 *     summary: Get unique Odoo categories
 *     tags: [Odoo]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', odooController.getCategories);

/**
 * @swagger
 * /api/odoo/stats:
 *   get:
 *     summary: Get Odoo module statistics
 *     tags: [Odoo]
 *     responses:
 *       200:
 *         description: Odoo statistics
 */
router.get('/stats', odooController.getStats);

/**
 * @swagger
 * /api/odoo/{id}:
 *   get:
 *     summary: Get Odoo module by ID
 *     tags: [Odoo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Odoo module object
 */
router.get('/:id', odooController.getOdooModuleById);

/**
 * @swagger
 * /api/odoo:
 *   post:
 *     summary: Create a new Odoo module
 *     tags: [Odoo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               category: { type: string }
 *               version: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *               screenshots: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201:
 *         description: Odoo module created
 */
router.post('/', authenticate, upload.array('screenshots', 5), odooController.createOdooModule);

/**
 * @swagger
 * /api/odoo/{id}:
 *   put:
 *     summary: Update an Odoo module
 *     tags: [Odoo]
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
 *               name: { type: string }
 *               category: { type: string }
 *               version: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *               screenshots: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       200:
 *         description: Odoo module updated
 */
router.put('/:id', authenticate, upload.array('screenshots', 5), odooController.updateOdooModule);

/**
 * @swagger
 * /api/odoo/{id}:
 *   delete:
 *     summary: Delete an Odoo module
 *     tags: [Odoo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Odoo module deleted
 */
router.delete('/:id', authenticate, odooController.deleteOdooModule);

/**
 * @swagger
 * /api/odoo/{id}/clients:
 *   put:
 *     summary: Update client count
 *     tags: [Odoo]
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
 *               clientsUsing: { type: number }
 *     responses:
 *       200:
 *         description: Client count updated
 */
router.put('/:id/clients', authenticate, odooController.updateClientCount);

module.exports = router;