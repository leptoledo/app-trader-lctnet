const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
    console.log("Testing connection...");
    const { data: cols, error: e2 } = await supabase.from('trades').select('*').limit(1);
    console.log("Cols error:", e2);
    console.log("Sample Data:", cols);
}
check();
