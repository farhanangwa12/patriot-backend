
import fs from 'fs';
import path from 'path';

import client from '../config/database.js';

async function runMigration() {
    try {

    

    
        const migrationDir = path.join(process.cwd(), 'src/migrations');
        const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql'));

        for (const file of files) {
            const filePath = path.join(migrationDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');
            console.log(`Running migration: ${file}`);
            await client.query(sql);

        }
        console.log("✅ All migrations executed successfully.");
    } catch (err) {
        console.error("❌ Migration error:", err);
    } finally {
        await client.end();
    }
}

runMigration();
