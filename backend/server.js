const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { errorHandler } = require('./src/helpers/errorHandler');
const logger = require('./src/utils/logger');

require('dotenv').config(); // Load environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(logger);

// Routes
const authRoutes = require('./src/v1/auth/auth.routes');
const recordsRoutes = require('./src/v1/records/records.routes');
const fileRoutes = require('./src/v1/records/file.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/records', recordsRoutes);
app.use('/api/v1/files', fileRoutes);

// Error Handling Middleware
app.use(errorHandler);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    
    console.log(`Server running on port ${PORT}`);

});
    
