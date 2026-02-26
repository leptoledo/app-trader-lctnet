require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('trades').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else if (data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    // If no data, try to select with limit 0 to just get returning structure or trigger an error to read the schema
    console.log("No data found.");
  }
}
run();
