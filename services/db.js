const { Pool } = require('pg');
const config = require('../config'); // Adjust path as needed to point to your config file

// Create a PostgreSQL connection pool using your config structure
const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to the database:', err.message);
    } else {
        console.log('✅ Connected to the database successfully');
        release();
    }
});

module.exports = {
    // Query function that returns a promise
    query: (text, params) => {
        console.log('Executing query:', text);
        console.log('Query parameters:', params);
        return pool.query(text, params);
    },
    // Get a client from the pool
    getClient: () => pool.connect()
};