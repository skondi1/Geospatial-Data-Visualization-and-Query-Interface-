 const express = require('express');
const { Pool } = require('pg');

// Initialize Express app
const app = express();

// Setup PostgreSQL connection
const pool = new Pool({
  host: 'unt-projects.chktvb2xs1un.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'stormevents',
  user: 'stormevents',
  password: 'Atlanta123!',
});

// Enable CORS (Add this if it's not already present in your server setup)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Define routes
app.get('/searchByCoordinates', async (req, res) => {
  console.log(`Received request for LATITUDE: ${req.query.lat}, LONGITUDE: ${req.query.lon}`); // Adjusted log message to match column names
  try {
      // Update the query to use the correct column names, ensuring they match the case exactly as in the database
      const query = `SELECT * FROM y2023.events WHERE "LATITUDE" = $1 OR "LONGITUDE" = $2`;
      const values = [req.query.lat, req.query.lon];
      const result = await pool.query(query, values);
      if (result.rows.length > 0) {
          res.json(result.rows);
      } else {
          // Send a message if no events are found for the provided coordinates
          res.json({ message: "No events found for the provided coordinates." });
      }
  } catch (err) {
      console.error(`Error querying the database: ${err}`);
      res.status(500).send('Error querying the database');
  }
});


// Test CORS route
app.get('/test', (req, res) => {
    res.send('CORS is working');
});

// Start the server
const port = 5500;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
