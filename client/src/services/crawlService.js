export async function startNewCrawl({ url, depth, pattern, intervalSeconds, mode }) {
  const createRes = await fetch("/api/website-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      label: `Auto ${new Date().toISOString()}`,
      regexp: pattern || ".*",
      periodicity: `${intervalSeconds}`,
      active: true,
      tags: [],
    }),
  });

  const newRecord = await createRes.json();

  await fetch("/api/crawl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      url,
      depth: parseInt(depth || "1"),
      pattern: pattern || ".*",
      website_record_id: newRecord.id,
      interval_seconds: intervalSeconds,
    }),
  });

  return newRecord.id;
}