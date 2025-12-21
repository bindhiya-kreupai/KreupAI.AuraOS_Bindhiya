/**
 * @swagger
 * /api/licenses:
 *   get:
 *     tags:
 *       - Licenses
 *     summary: List all licenses
 *     description: Get a paginated list of licenses for the authenticated user's tenant
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, Expired, Suspended]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Trial, Professional, Enterprise]
 *     responses:
 *       200:
 *         description: Licenses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/License'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *
 *   post:
 *     tags:
 *       - Licenses
 *     summary: Create a new license
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *               - type
 *               - totalSeats
 *               - expiresAt
 *             properties:
 *               tenantId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Trial, Professional, Enterprise]
 *               totalSeats:
 *                 type: integer
 *                 minimum: 1
 *               usedSeats:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Expired, Suspended]
 *                 default: Active
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: License created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/License'
 *
 * /api/licenses/{id}:
 *   get:
 *     tags:
 *       - Licenses
 *     summary: Get license by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: License retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/License'
 *
 *   put:
 *     tags:
 *       - Licenses
 *     summary: Update license
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalSeats:
 *                 type: integer
 *               usedSeats:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Expired, Suspended]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: License updated successfully
 *
 *   delete:
 *     tags:
 *       - Licenses
 *     summary: Delete license
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: License deleted successfully
 */

export {};
