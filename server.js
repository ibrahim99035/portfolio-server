const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const certificatesRoutes = require('./routes/certificates');
const imagesRoutes = require('./routes/images');
const journeyRoutes = require('./routes/journey');
const landingPagesRoutes = require('./routes/landingPages');
const linkedinRoutes = require('./routes/linkedin');
const odooRoutes = require('./routes/odoo');
const personalInfoRoutes = require('./routes/personalInfo');

// Swagger
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API',
      version: '1.0.0',
      description: 'API Documentation for Your Node.js App',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API docs (adjust if needed)
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/landing-pages', landingPagesRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/odoo', odooRoutes);
app.use('/api/personal-info', personalInfoRoutes);

// Serve static files from the dashboard directory
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      redis: 'connected',
      cloudinary: 'connected'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📘 Swagger docs available at http://localhost:${PORT}/api-docs`);
});