const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoDBUri = process.env.MONGODB_URI;

const schema = require('./schema/schema');

const app = express();

// Middleware to allow cross-origin requests
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(mongoDBUri);
mongoose.connection.once('open', () => {
  console.log('Connected to database');
});

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

// API endpoint to update config
app.post('/api/updateConfig', (req, res) => {
    const { newConfig } = req.body;

    // Example: Update APP_MODE in .env file
    if (newConfig && typeof newConfig === 'string') {
        const configLines = fs.readFileSync('../../.env', 'utf8').split('\n');
        let updatedConfig = '';

        // Update APP_MODE if found, otherwise retain existing lines
        configLines.forEach(line => {
            if (line.startsWith('APP_MODE=')) {
                updatedConfig += `APP_MODE=${newConfig}\n`;
            } else {
                updatedConfig += `${line}\n`;
            }
        });

        // Write updated config back to .env file
        fs.writeFileSync('.env', updatedConfig);

        res.status(200).send('Config updated successfully.');
    } else {
        res.status(400).send('Invalid newConfig provided.');
    }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
