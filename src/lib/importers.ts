import Papa from 'papaparse';
import { Trade } from '@/types';

export interface BrokerAdapter {
    id: string;
    name: string;
    map: (row: Record<string, string>) => Partial<Trade>;
}

export const BROKER_ADAPTERS: BrokerAdapter[] = [
    {
        id: 'tickmill',
        name: 'Tickmill / MT4 / MT5',
        map: (row) => {
            const normalize = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\ufffd]/g, "").trim() : "";

            const getVal = (keys: string[]) => {
                const rowKeys = Object.keys(row);
                const searchKeys = keys.map(k => normalize(k));
                for (const k of rowKeys) {
                    const nk = normalize(k);
                    if (searchKeys.includes(nk)) return row[k];
                }
                return null;
            };

            const cleanNum = (val: string | number | null | undefined): number => {
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

            const parseDateISO = (val: string | null | undefined): string => {
                if (!val) return new Date().toISOString();
                const s = String(val).trim().replace(/\./g, '-');
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

            const ticketId = getVal(['Position', 'Ticket', 'Order', 'Deal', 'Posicao']);
            const symbol = getVal(['Ativo', 'Symbol', 'Item', 'Asset', 'Ticker', 'Simbolo']);
            const typeRaw = normalize(String(getVal(['Tipo', 'Type', 'Side', 'Direcao']) || ''));
            const isBuy = typeRaw.includes('buy') || typeRaw.includes('compra');
            const isSell = typeRaw.includes('sell') || typeRaw.includes('venda');

            // 🛡️ Ignora linhas que não são de execução (Saldo, Crédito, etc)
            if (!isBuy && !isSell) return { symbol: 'SKIPPED' } as Partial<Trade>;

            const direction = isBuy ? 'LONG' : 'SHORT';

            // Dados financeiros
            const quantity = cleanNum(getVal(['Volume', 'Lots', 'Quantidade', 'Lotes']));
            const entryPrice = cleanNum(getVal(['Preco', 'Price', 'Open Price', 'Abertura']));
            const exitPrice = cleanNum(getVal(['Preco_1', 'Price_1', 'Close Price', 'Fechamento']));

            const pnlGross = cleanNum(getVal(['Lucro', 'Profit', 'Resultado']));
            const commission = cleanNum(getVal(['Comissao', 'Commission', 'Taxas']));
            const swap = cleanNum(getVal(['Swap']));

            const entryDate = parseDateISO(getVal(['Tempo', 'Horario', 'Time', 'Open Time', 'Date', 'Abertura', 'Data']));
            const exitDate = parseDateISO(getVal(['Horario_1', 'Time_1', 'Tempo_1', 'Data_1', 'Time 1', 'Close Time', 'Saida', 'Fechamento']));

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
            const normalize = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\ufffd]/g, "").trim() : "";

            const getVal = (keys: string[]) => {
                const rowKeys = Object.keys(row);
                const searchKeys = keys.map(k => normalize(k));
                for (const k of rowKeys) {
                    const nk = normalize(k);
                    if (searchKeys.includes(nk)) return row[k];
                }
                return null;
            };

            const cleanNum = (val: string | number | null | undefined): number => {
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

            const typeRaw = normalize(String(getVal(['Direction', 'Side', 'Tipo', 'Sentido', 'Direcao']) || ''));
            const isBuy = typeRaw.includes('buy') || typeRaw.includes('compra') || typeRaw.startsWith('b') || typeRaw.startsWith('c');

            const parseDateGeneric = (val: string | null | undefined): string => {
                if (!val) return new Date().toISOString();
                const s = String(val).trim().replace(/\./g, '-');
                const parts = s.split(/[\-\s\:]/);
                if (parts.length >= 3) {
                    let y, m, d, hh = '00', mm = '00', ss = '00';
                    if (parts[0].length === 4) { [y, m, d] = parts; } else { [d, m, y] = parts; }
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

            return {
                symbol: getVal(['Symbol', 'asset', 'Ativo', 'Ticker', 'Simbolo']) || 'UNKNOWN',
                direction: isBuy ? 'LONG' : 'SHORT',
                entry_price: cleanNum(getVal(['Entry', 'Price', 'Preco', 'Open Price', 'Abertura'])),
                exit_price: cleanNum(getVal(['Exit', 'Close', 'Fechamento', 'Saida', 'Preco_1', 'Price_1'])),
                quantity: cleanNum(getVal(['Quantity', 'Size', 'Volume', 'Lots', 'Lotes', 'Quantidade'])),
                entry_date: parseDateGeneric(getVal(['Data', 'Tempo', 'Time', 'Horario', 'Date', 'Abertura', 'Open Time'])),
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

                // MetaTrader 5 / Fourmarkets common binary null bytes detection
                if (text.indexOf('\0') !== -1 && text.indexOf('\0') < 100) {
                    console.log("[CSV Engine] Caracteres nulos detectados. Aplicando Fallback para UTF-16LE...");
                    decoder = new TextDecoder('utf-16le');
                    text = decoder.decode(buffer);
                }
                // Detection of invalid UTF-8 rendering as '\uFFFD' (Replacement Char)
                else if (text.includes('\uFFFD')) {
                    console.log("[CSV Engine] Caracteres de charset corrompido. Fallback para Windows-1252 / ISO-8859-1...");
                    decoder = new TextDecoder('windows-1252');
                    text = decoder.decode(buffer);
                }
                // Standard fallback if keywords still not matched
                else {
                    const keywords = ['horario', 'preco', 'profit', 'lucro', 'time', 'symbol', 'ativo', 'volume', 'position'];
                    const normalizeStr = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                    if (!keywords.some(kw => normalizeStr(text.slice(0, 5000)).includes(kw))) {
                        console.log("[CSV Engine] Palavras chaves nao encontradas. Fallback para Windows-1252...");
                        decoder = new TextDecoder('windows-1252');
                        text = decoder.decode(buffer);
                    }
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
                            reject(new Error("O arquivo CSV selecionado está vazio ou ilegível."));
                            return;
                        }

                        // Sistema Dinâmico de Extração Multi-Tabela
                        const headerKeywords = [
                            'symbol', 'ticket', 'time', 'login', 'ativo', 'profit', 'position', 'deal',
                            'volume', 'price', 'item', 'lotes', 'horario', 'quantidade', 'preco',
                            's / l', 't / p', 'sl', 'tp', 'lucro', 'comissao', 'tempo', 'data'
                        ];

                        let activeHeaders: string[] | null = null;
                        const validTrades: Partial<Trade>[] = [];
                        let isTableValid = false;

                        rows.forEach((row, idx) => {
                            if (!row || row.length < 2) return;
                            const normalizeStr = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                            // Clean the row to search for keywords without formatting matching random numbers
                            const lineContent = normalizeStr(row.map(cell => String(cell).trim()).join(' '));
                            const matches = headerKeywords.filter(kw => lineContent.includes(kw)).length;

                            // Checks if this is likely a header. Data rows normally have lots of digits.
                            const hasNumbers = /\d{2,}/.test(lineContent);
                            const isHeaderLine = matches >= 3 && (!hasNumbers || matches >= 5);

                            if (isHeaderLine) {
                                const rawHeaders = row.map(h => h ? String(h).trim().replace(/"/g, '') : '');
                                activeHeaders = [];
                                const seen: Record<string, number> = {};
                                rawHeaders.forEach(h => {
                                    if (!h) { activeHeaders!.push(''); return; }
                                    if (seen[h]) { activeHeaders!.push(`${h}_${seen[h]}`); seen[h]++; }
                                    else { activeHeaders!.push(h); seen[h] = 1; }
                                });

                                const headerSignature = normalizeStr(activeHeaders.join(' '));
                                const hasProfitField = headerSignature.includes('profit') || headerSignature.includes('lucro') || headerSignature.includes('resultado');
                                const hasDirectionField = headerSignature.includes('direction') || headerSignature.includes('direcao');

                                // Lógica de Blindagem: O MT5 exporta 3 blocos (Orders, Deals, Positions).
                                // Orders quebra pq n tem Profit. Deals quebra pois as colunas In/Out deslizam as posições (Direction), separando o mesmo trade em 2.
                                // Queremos apenas o bloco principal (Positions/Closed).
                                if (adapterId === 'generic') {
                                    isTableValid = true;
                                } else {
                                    isTableValid = hasProfitField && !hasDirectionField;
                                }
                                return; // Pula a linha de cabeçalho
                            }

                            if (activeHeaders && isTableValid) {
                                const obj: Record<string, string> = {};
                                activeHeaders.forEach((h, i) => { if (h) obj[h] = row[i]; });

                                const t = adapter.map(obj);

                                if (t) {
                                    const sym = (t.symbol || "").toUpperCase();
                                    const isIgnored = sym.includes('BALANCE') || sym.includes('DEPOSIT') || sym.includes('CREDIT') || sym.includes('SKIPPED') || sym === 'UNKNOWN';

                                    const hasQuantity = t.quantity !== undefined && t.quantity > 0;
                                    const hasPrice = t.entry_price !== undefined && t.entry_price > 0;
                                    const hasPnL = t.pnl_gross !== undefined && t.pnl_gross !== null;

                                    if (hasPrice && (hasQuantity || hasPnL) && !isIgnored) {
                                        validTrades.push(t);
                                    }
                                }
                            }
                        });

                        if (validTrades.length === 0) {
                            reject(new Error(`O CSV foi lido, mas nenhuma linha foi válida (ex: Valores Desalinhados ou Faltando Preço/Volume). Certifique-se de ser a tabela principal.`));
                            return;
                        }

                        console.log(`[CSV Engine] Sucesso: ${validTrades.length} trades identificados.`);
                        resolve(validTrades);
                    },
                    error: (err: Error) => {
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
