
import env from './env.js';
const database = {
    user: env.DB_USER,
    host: env.DB_HOST,
    database: env.DB_NAME,
    password: env.DB_PASSWORD,
    port: env.DB_PORT,
}


import { Client } from 'pg';

const client = new Client(database);
client.connect().then(() => console.log('✅ Connected to PostgreSQL')).catch(err => console.error('❌ Connection error', err));


export default client;