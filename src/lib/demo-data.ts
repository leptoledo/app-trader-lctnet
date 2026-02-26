export function generateDemoTrades() {
    const trades = [];
    const symbols = ["EURUSD", "GBPUSD", "US30", "NAS100", "XAUUSD", "BTCUSD", "AAPL", "TSLA"];
    const now = new Date();

    // Simulate ~90 trades over the last 60 days
    const numTrades = 90;
    let balance = 10000;

    for (let i = numTrades; i >= 0; i--) {
        const daysAgo = Math.floor((i / numTrades) * 60) + (Math.random() * 0.5); // Add some noise

        // Skip weekends roughly
        const tradeDate = new Date(now);
        tradeDate.setDate(tradeDate.getDate() - daysAgo);

        const dayOfWeek = tradeDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            tradeDate.setDate(tradeDate.getDate() - (dayOfWeek === 0 ? 2 : 1)); // push to Friday
        }

        // Random hour between 8am and 16pm (good trading times)
        const randomHour = Math.floor(Math.random() * 8 + 8);
        tradeDate.setHours(randomHour, Math.floor(Math.random() * 60));

        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const direction = Math.random() > 0.5 ? "LONG" : "SHORT";

        // Let's configure a profitable strategy: 62% win rate
        const isWin = Math.random() < 0.62;

        // Wins are slightly bigger than losses
        const amount = isWin
            ? Math.random() * 350 + 100 // Win between $100 and $450
            : -(Math.random() * 200 + 50); // Loss between -$50 and -$250

        const commission = Math.random() * 15;
        const pnlNet = amount;
        const pnlGross = amount + commission;

        const volume = parseFloat((Math.random() * 3 + 0.1).toFixed(2));

        // Exit time: 30 mins to 4 hours later
        const exitDate = new Date(tradeDate.getTime() + (Math.random() * 3.5 + 0.5) * 3600 * 1000);

        let rrRatio;
        if (isWin) {
            rrRatio = parseFloat((Math.random() * 2 + 1.2).toFixed(2)); // 1.2R to 3.2R
        } else {
            rrRatio = parseFloat((-(Math.random() * 0.5 + 0.5)).toFixed(2)); // -0.5R to -1.0R
        }

        trades.push({
            id: `demo-trade-${i}`,
            account_id: "demo-account",
            profile_id: "demo-user",
            symbol,
            direction,
            status: "CLOSED",
            entry_price: symbol.includes("USD") || symbol === "EURUSD" ? parseFloat((Math.random() * 0.1 + 1.05).toFixed(4)) : parseFloat((Math.random() * 5000 + 33000).toFixed(2)),
            exit_price: symbol.includes("USD") || symbol === "EURUSD" ? parseFloat((Math.random() * 0.1 + 1.06).toFixed(4)) : parseFloat((Math.random() * 5000 + 33100).toFixed(2)),
            volume,
            pnl_gross: parseFloat(pnlGross.toFixed(2)),
            commission: parseFloat(commission.toFixed(2)),
            pnl_net: parseFloat(pnlNet.toFixed(2)),
            entry_date: tradeDate.toISOString(),
            exit_date: exitDate.toISOString(),
            rr_ratio: rrRatio,
            created_at: tradeDate.toISOString(),
            updated_at: tradeDate.toISOString()
        });

        balance += pnlNet;
    }

    // Add a couple of trades for "today" specifically to ensure the 'dashboard recent trades' looks alive
    const todayWin = {
        id: `demo-trade-today-win`,
        account_id: "demo-account",
        profile_id: "demo-user",
        symbol: "US30",
        direction: "LONG",
        status: "CLOSED",
        entry_price: 38450.00,
        exit_price: 38550.00,
        volume: 2.0,
        pnl_gross: 415.00,
        commission: 15.00,
        pnl_net: 400.00,
        entry_date: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
        exit_date: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
        rr_ratio: 2.5,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
    };

    const todayLoss = {
        id: `demo-trade-today-loss`,
        account_id: "demo-account",
        profile_id: "demo-user",
        symbol: "EURUSD",
        direction: "SHORT",
        status: "CLOSED",
        entry_price: 1.0850,
        exit_price: 1.0870,
        volume: 5.0,
        pnl_gross: -190.00,
        commission: 10.00,
        pnl_net: -200.00,
        entry_date: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
        exit_date: new Date(now.getTime() - 4.5 * 3600 * 1000).toISOString(),
        rr_ratio: -1.0,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
    };

    trades.push(todayWin, todayLoss);

    // Sort descending by entry_date (newest first)
    return trades.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
}

export const demoTrades = generateDemoTrades();
