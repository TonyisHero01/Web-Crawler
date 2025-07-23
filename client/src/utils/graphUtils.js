export function prepareGraphData(pages) {
  const nodes = pages.map(p => ({
    id: String(p._id),
    text: String(p.title || p.url || `Page ${p._id}`),
  }));

  const seen = new Set();
  const lines = pages
    .filter(p => p.from_id != null)
    .map(p => ({ from: String(p.from_id), to: String(p._id) }))
    .filter(line => {
      const key = `${line.from}-${line.to}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return { nodes, lines };
}