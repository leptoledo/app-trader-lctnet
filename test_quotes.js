const http = require('http');

async function test() {
  const fetch = (await import('node-fetch')).default;
  try {
    const res = await fetch('http://localhost:3000/api/quotes?symbols=GOLD');
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.log(e.message);
  }
}
test();
