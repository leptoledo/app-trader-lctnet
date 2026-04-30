const METAAPI_TOKEN = process.env.METAAPI_TOKEN;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL + "/api/integrations/metatrader/webhook";

async function registerWebhooks() {
  console.log("Fetching MetaApi accounts...");
  
  const res = await fetch("https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts", {
    headers: { "auth-token": METAAPI_TOKEN }
  });
  
  if (!res.ok) {
    console.error("Failed to fetch accounts:", await res.text());
    return;
  }
  
  const accounts = await res.json();
  console.log(`Found ${accounts.length} accounts.`);
  
  for (const account of accounts) {
    const accountId = account._id || account.id;
    if (!accountId) {
      console.log("Account object:", JSON.stringify(account));
      continue;
    }
    console.log(`Registering webhook for account ${accountId} (${account.name})...`);
    
    // Register synchronization webhook
    const webhookRes = await fetch(`https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${accountId}/webhooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": METAAPI_TOKEN
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        type: "synchronization"
      })
    });
    
    if (webhookRes.ok) {
      console.log(`Successfully registered webhook for account ${accountId}.`);
    } else {
      const errText = await webhookRes.text();
      // If it already exists, it might return 400 or 409
      console.error(`Failed to register webhook for account ${accountId}:`, errText);
    }
  }
}

registerWebhooks();
