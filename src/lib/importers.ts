import Papa from 'papaparse';
import { Trade } from '@/types';

export interface BrokerAdapter {
    id: string;
    name: string;
    map: (row: any) => Partial<Trade>;
}

export const BROKER_ADAPTERS: BrokerAdapter[] = [
    {
        id: 'tickmill',
        name: 'Tickmill / MT4 / MT5',
        map: (row) => {
            const normalize = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

            const getVal = (keys: string[]) => {
                const rowKeys = Object.keys(row);
                const searchKeys = keys.map(k => normalize(k));
                for (const k of rowKeys) {
                    const nk = normalize(k);
                    if (searchKeys.includes(nk)) return row[k];
                }
                return null;
            };

            const cleanNum = (val: any) => {
                if (val === null || val === undefined || val === '') return 0;
                let s = String(val).trim().replace(/[^0-9.,-]/g, '');
                if (!s) return 0;

                const lastDot = s.lastIndexOf('.');
                const lastComma = s.lastIndexOf(',');

                if (lastComma > lastDot) {
                    s = s.replace(/\./g, '').replace(',', '.');
                } else if (lastDot > lastComma) {
                    s = s.replace(/,/g, '');
                }
                return parseFloat(s) || 0;
            };

            const parseDateISO = (val: any): string => {
                if (!val) return new Date().toISOString();
                let s = String(val).trim().replace(/\./g, '-');
                const parts = s.split(/[\-\s\:]/);

                if (parts.length >= 3) {
                    let y, m, d, hh = '00', mm = '00', ss = '00';
                    if (parts[0].length === 4) { [y, m, d] = parts; }
                    else { [d, m, y] = parts; }

                    const timeIdx = s.indexOf(' ');
                    if (timeIdx !== -1) {
                        const timePart = s.slice(timeIdx + 1).split(':');
                        hh = (timePart[0] || '0').padStart(2, '0');
                        mm = (timePart[1] || '0').padStart(2, '0');
                        ss = (timePart[2] || '0').padStart(2, '0');
                    }
                    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${hh}:${mm}:${ss}`;
                }
                return new Date().toISOString();
            };

            const ticketId = getVal(['Position', 'Ticket', 'Order', 'Deal']);
            const symbol = getVal(['Ativo', 'Symbol', 'Item', 'Asset', 'Ticker']);
            const typeRaw = normalize(String(getVal(['Tipo', 'Type', 'Side']) || ''));
            const isBuy = typeRaw.includes('buy') || typeRaw.includes('compra');
            const isSell = typeRaw.includes('sell') || typeRaw.includes('venda');

            // 🛡️ Ignora linhas que não são de execução (Saldo, Crédito, etc)
            if (!isBuy && !isSell) return { symbol: 'SKIPPED' } as any;

            const direction = isBuy ? 'LONG' : 'SHORT';

            // Dados financeiros
            const quantity = cleanNum(getVal(['Volume', 'Lots', 'Quantidade', 'Lotes']));
            const entryPrice = cleanNum(getVal(['Preco', 'Price', 'Open Price', 'Abertura']));
            const exitPrice = cleanNum(row['Preco_1'] || row['Price_1'] || getVal(['Close Price', 'Fechamento']));

            const pnlGross = cleanNum(getVal(['Lucro', 'Profit', 'Resultado']));
            const commission = cleanNum(getVal(['Comissao', 'Commission', 'Taxas']));
            const swap = cleanNum(getVal(['Swap']));

            const entryDate = parseDateISO(getVal(['Horario', 'Time', 'Date', 'Abertura']));
            const exitDate = parseDateISO(row['Horario_1'] || row['Time_1'] || getVal(['Close Time', 'Saida']));

            return {
                ticket_id: ticketId ? String(ticketId).trim() : null,
                symbol: symbol ? String(symbol).trim().split(' ')[0].toUpperCase() : 'UNKNOWN',
                direction,
                entry_date: entryDate,
                exit_date: exitDate,
                entry_price: entryPrice,
                exit_price: exitPrice,
                quantity: quantity,
                stop_loss: cleanNum(getVal(['S / L', 'SL', 'Stop Loss'])),
                take_profit: cleanNum(getVal(['T / P', 'TP', 'Take Profit'])),
                commission: commission,
                swap: swap,
                fees: Math.abs(commission) + Math.abs(swap),
                pnl_gross: pnlGross,
                pnl_net: pnlGross - Math.abs(commission) - Math.abs(swap),
                status: 'CLOSED'
            };
        }
    },
    {
        id: 'generic',
        name: 'Planilha Genérica (CSV)',
        map: (row) => {
            const cleanNum = (val: any) => {
                if (!val) return 0;
                return parseFloat(String(val).replace(/[^0-9.-]/g, '').replace(',', '.')) || 0;
            };
            return {
                symbol: row['Symbol'] || row['asset'] || row['Ativo'] || 'UNKNOWN',
                direction: (row['Direction'] || row['Side'] || row['Tipo'] || row['Sentido'])?.toUpperCase().startsWith('B') ? 'LONG' : 'SHORT',
                entry_price: cleanNum(row['Entry'] || row['Price'] || row['Preco']),
                exit_price: cleanNum(row['Exit'] || row['Close'] || row['Fechamento']),
                quantity: cleanNum(row['Quantity'] || row['Size'] || row['Volume'] || row['Lots']),
                entry_date: new Date().toISOString(),
                status: 'CLOSED'
            };
        }
    }
];

export async function parseTradesCSV(file: File, adapterId: string): Promise<Partial<Trade>[]> {
    const adapter = BROKER_ADAPTERS.find(a => a.id === adapterId) || BROKER_ADAPTERS[0];

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const buffer = e.target?.result as ArrayBuffer;

                // Detecção de Encoding Robusta
                let decoder = new TextDecoder('utf-8');
                let text = decoder.decode(buffer);

                const keywords = ['horario', 'preco', 'profit', 'lucro', 'time', 'symbol', 'ativo', 'volume', 'position'];
                const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                if (!keywords.some(kw => normalize(text.slice(0, 5000)).includes(kw))) {
                    console.log("[CSV Engine] Tentando Fallback para ISO-8859-1...");
                    decoder = new TextDecoder('iso-8859-1');
                    text = decoder.decode(buffer);
                }

                text = text.replace(/^\ufeff/, '').trim();

                // 🔍 Detecção Manual de Delimitador (Robusta)
                const firstLines = text.slice(0, 2000);
                const counts = {
                    comma: (firstLines.match(/,/g) || []).length,
                    semicolon: (firstLines.match(/;/g) || []).length,
                    tab: (firstLines.match(/\t/g) || []).length
                };
                let delimiter = ',';
                if (counts.semicolon > counts.comma && counts.semicolon > counts.tab) delimiter = ';';
                if (counts.tab > counts.comma && counts.tab > counts.semicolon) delimiter = '\t';

                console.log(`[CSV Engine] Delimitador provável: "${delimiter === '\t' ? '\\t' : delimiter}" (C:${counts.comma} S:${counts.semicolon} T:${counts.tab})`);

                Papa.parse(text, {
                    header: false,
                    skipEmptyLines: 'greedy',
                    delimiter: delimiter,
                    dynamicTyping: false,
                    complete: (results) => {
                        const rows = results.data as string[][];
                        if (!rows || rows.length === 0) {
                            console.warn("[CSV Engine] Arquivo vazio.");
                            resolve([]);
                            return;
                        }

                        // Localização Inteligente do Cabeçalho
                        const headerKeywords = [
                            'symbol', 'ticket', 'time', 'login', 'ativo', 'profit', 'position', 'deal',
                            'volume', 'price', 'item', 'lotes', 'horario', 'quantidade', 'preco',
                            's / l', 't / p', 'sl', 'tp', 'lucro', 'comissao'
                        ];
                        let headerRowIndex = -1;
                        let maxMatches = 0;

                        // Analisa as primeiras 100 linhas
                        rows.slice(0, 100).forEach((row, idx) => {
                            if (!row || row.length < 2) return;
                            const lineContent = normalize(row.join(' '));
                            const matches = headerKeywords.filter(kw => lineContent.includes(kw)).length;

                            // Se encontrar pelo menos 2 termos técnicos, consideramos um possível cabeçalho
                            if (matches > maxMatches && matches >= 2) {
                                maxMatches = matches;
                                headerRowIndex = idx;
                            }
                        });

                        if (headerRowIndex === -1) {
                            console.error("[CSV Engine] Falha ao localizar cabeçalho. Linhas analisadas: 100");
                            console.log("[CSV Engine] Amostra da linha 1:", rows[0]);
                            resolve([]);
                            return;
                        }

                        const rawHeaders = rows[headerRowIndex].map(h => h ? String(h).trim().replace(/"/g, '') : '');
                        console.log("[CSV Engine] Cabeçalho Encontrado:", rawHeaders);

                        const headers: string[] = [];
                        const seen: Record<string, number> = {};
                        rawHeaders.forEach(h => {
                            if (!h) { headers.push(''); return; }
                            if (seen[h]) { headers.push(`${h}_${seen[h]}`); seen[h]++; }
                            else { headers.push(h); seen[h] = 1; }
                        });

                        const dataRows = rows.slice(headerRowIndex + 1);
                        const trades = dataRows
                            .map(row => {
                                const obj: any = {};
                                headers.forEach((h, i) => { if (h) obj[h] = row[i]; });
                                return adapter.map(obj);
                            })
                            .filter(t => {
                                if (!t) return false;
                                const sym = (t.symbol || "").toUpperCase();
                                // Filtro refinado para ignorar metadados
                                const isIgnored = sym.includes('BALANCE') || sym.includes('DEPOSIT') || sym.includes('CREDIT') || sym.includes('SKIPPED') || sym === 'UNKNOWN';

                                // Dados financeiros básicos
                                const hasQuantity = t.quantity && t.quantity > 0;
                                const hasPrice = t.entry_price && t.entry_price > 0;
                                const hasPnL = t.pnl_gross !== undefined && t.pnl_gross !== null;

                                return hasPrice && (hasQuantity || hasPnL) && !isIgnored;
                            });

                        console.log(`[CSV Engine] Sucesso: ${trades.length} trades identificados.`);
                        resolve(trades);
                    },
                    error: (err: any) => {
                        console.error("[CSV Engine] Erro no processamento:", err);
                        reject(err);
                    }
                });
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}
