const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgresql://postgres:15Ja2006**@db.fybwtdioojxoxibyuejr.supabase.co:5432/postgres'
});

async function run() {
    await client.connect();
    const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'trades' AND table_schema = 'public';
  `);
    console.log(res.rows);
    await client.end();
}
run();
