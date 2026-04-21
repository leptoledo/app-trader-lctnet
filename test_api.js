const payload1 = {"price":"4718.3165"};
const data1 = {};
let symbols1 = ["XAU/USD"];
if (typeof payload1?.price === "string") {
  const symbol = symbols1[0]
  const value = Number(payload1.price)
  if (!Number.isNaN(value)) data1[symbol] = value
}
console.log(data1);

const payload2 = {"XAU/USD":{"price":"4718.3165"},"BTC/USD":{"price":"60000.00"}};
const data2 = {};
if (typeof payload2?.price === "string") {
  // ...
} else if (payload2 && typeof payload2 === "object") {
  for (const [key, value] of Object.entries(payload2)) {
    const price = value?.price
    if (typeof price === "string") {
      const numeric = Number(price)
      if (!Number.isNaN(numeric)) data2[key.toUpperCase()] = numeric
    }
  }
}
console.log(data2);
