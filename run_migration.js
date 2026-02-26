const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    host: 'db.fybwtdioojxoxibyuejr.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '15Ja2006**',
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to database.");

        // Ler o script SQL escrito anteriormente
        const sqlPath = path.join(__dirname, 'supabase', 'migrations', '20260226130000_create_blog_posts.sql');
        const sqlScript = fs.readFileSync(sqlPath, 'utf8');

        // Executar script no Supabase remoto
        const res = await client.query(sqlScript);
        console.log("Migration executada com sucesso!");

    } catch (err) {
        console.error("Erro na execução: ", err.stack);
    } finally {
        await client.end();
    }
}

run();
