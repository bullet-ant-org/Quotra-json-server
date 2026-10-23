// Daily series with zero days filled in, oldest first.
export const fillDays = (rows, n) => { const m = new Map(rows.map((r) => [r._id, r.n])); return Array.from({ length: n }, (_, i) => { const d = new Date(Date.now() - (n - 1 - i) * 864e5).toISOString().slice(0, 10); return { day: d, n: m.get(d) ?? 0 }; }); };
