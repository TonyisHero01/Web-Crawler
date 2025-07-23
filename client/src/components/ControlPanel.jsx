import { Input, Button } from '@douyinfe/semi-ui';

export default function ControlPanel({
  url, setUrl,
  depth, setDepth,
  pattern, setPattern,
  intervalSeconds, setIntervalSeconds,
  onStartCrawling,
  onRefresh,
  pollCount,
}) {
  return (
    <>
      <Input placeholder="URL" value={url} onChange={setUrl} />
      <Input placeholder="Depth" type="number" value={depth} onChange={setDepth} />
      <Input placeholder="Regex Pattern" value={pattern} onChange={setPattern} />
      Fill seconds:
      <Input
        placeholder="Polling interval (seconds)"
        type="number"
        value={intervalSeconds}
        onChange={v => setIntervalSeconds(parseInt(v))}
      />

      <Button onClick={onStartCrawling} type="primary">
        🚀 Start Crawling
      </Button>

      <Button onClick={onRefresh}>
        🔄 Refresh
      </Button>

      <div>🔁 Polling Count: {pollCount}</div>
    </>
  );
}