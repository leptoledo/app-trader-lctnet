import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

const METAAPI_TOKEN = process.env.METAAPI_TOKEN || ""

// MetaApi sends trade synchronization events to this webhook.
// Configure webhook URL in MetaApi portal as:
// POST https://yourdomain.com/api/integrations/metatrader/webhook
export async function POST(req: NextRequest) {
    try {
        // Validate MetaApi signature (via query param or header)
        const accountId = req.nextUrl.searchParams.get("accountId")
        const userId = req.nextUrl.searchParams.get("userId")

        if (!accountId || !userId) {
            return NextResponse.json({ error: "Missing accountId or userId" }, { status: 400 })
        }

        const body = await req.json()
        const supabaseAdmin = createSupabaseAdminClient()

        // Verify this account belongs to this user
        const { data: account } = await supabaseAdmin
            .from("mt_connected_accounts")
            .select("id, user_id")
            .eq("metaapi_account_id", accountId)
            .eq("user_id", userId)
            .single()

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 })
        }

        // MetaApi sends synchronization events (deals history)
        // Process deals array from the event payload
        const deals: any[] = body.deals || []
        if (deals.length === 0) {
            return NextResponse.json({ ok: true, processed: 0 })
        }

        const upsertData = deals
            .filter(d => d.type === "DEAL_TYPE_BUY" || d.type === "DEAL_TYPE_SELL")
            .filter(d => d.entryType === "DEAL_ENTRY_OUT" || d.entryType === "DEAL_ENTRY_IN")
            .map(deal => ({
                user_id: userId,
                account_id: account.id,
                ticket_id: deal.positionId || deal.id,
                symbol: deal.symbol,
                type: deal.type === "DEAL_TYPE_BUY" ? "LONG" : "SHORT",
                status: deal.entryType === "DEAL_ENTRY_OUT" ? "closed" : "open",
                entry_date: deal.time,
                exit_date: deal.entryType === "DEAL_ENTRY_OUT" ? deal.time : null,
                entry_price: deal.price,
                exit_price: deal.entryType === "DEAL_ENTRY_OUT" ? deal.price : null,
                quantity: deal.volume,
                profit_loss: deal.profit || 0,
                swap: deal.swap || 0,
                commission: deal.commission || 0,
                magic_number: deal.magic ? String(deal.magic) : null,
            }))

        if (upsertData.length === 0) {
            return NextResponse.json({ ok: true, processed: 0 })
        }

        const { error } = await supabaseAdmin
            .from("trades")
            .upsert(upsertData, { onConflict: "ticket_id, user_id" })

        if (error) {
            console.error("[MT WEBHOOK] DB Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Update last_synced_at on the account
        await supabaseAdmin
            .from("mt_connected_accounts")
            .update({ last_synced_at: new Date().toISOString(), status: "DEPLOYED" })
            .eq("metaapi_account_id", accountId)

        return NextResponse.json({ ok: true, processed: upsertData.length })
    } catch (error: any) {
        console.error("[MT WEBHOOK] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
