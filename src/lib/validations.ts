
import { z } from "zod"

export const tradeSchema = z.object({
    symbol: z.string().min(1, "Symbol is required").toUpperCase(),
    direction: z.enum(["LONG", "SHORT"]),
    entry_date: z.string(),
    entry_price: z.coerce.number().positive("Must be positive"),
    stop_loss: z.coerce.number().positive("Must be positive").optional(),
    take_profit: z.coerce.number().positive("Must be positive").optional(),
    quantity: z.coerce.number().positive("Quantity must be positive"),

    // Exit / Closure fields
    exit_date: z.string().optional(),
    exit_price: z.coerce.number().positive().optional(),
    fees: z.coerce.number().min(-1000000).optional(),
    commission: z.coerce.number().optional(),
    swap: z.coerce.number().optional(),
    ticket_id: z.string().optional(),
    status: z.enum(["OPEN", "CLOSED", "PENDING"]).optional(),

    setup_tags: z.string().optional(),
    notes: z.string().optional(),
    account_id: z.string().min(1, "Account is required")
}).refine(data => {
    if (data.status === 'CLOSED') {
        return !!data.exit_price && !!data.exit_date;
    }
    return true;
}, {
    message: "Exit Price and Date are required when closing a trade",
    path: ["exit_price"]
});

export type TradeFormValues = z.infer<typeof tradeSchema>
