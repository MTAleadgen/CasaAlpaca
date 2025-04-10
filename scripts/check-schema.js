// Script to check database schema
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get columns from properties table
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'properties'
      ORDER BY ordinal_position
    `);

    console.log('Properties table columns:');
    console.table(result.rows);

  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

checkSchema(); 