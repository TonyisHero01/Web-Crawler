import { ApolloProvider, useQuery } from '@apollo/client';
import client from './apolloClient';
import { GET_PAGES, GET_WEBSITE_RECORDS } from './graphql/queries';
import { CrawlMode } from './constants';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Space, RadioGroup, Radio, SideSheet,
  Input, Typography, List, Button, Select
} from '@douyinfe/semi-ui';
import RelationGraph from 'relation-graph-react';

function Index() {
  const { Title } = Typography;
  const [mode, setMode] = useState(CrawlMode.INACTIVE);
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState('');
  const [pattern, setPattern] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const graphRef = useRef(null);
  // 在顶部 useState 中新增
  const [shouldPoll, setShouldPoll] = useState(false);

  const { data: recordsData, refetch: refetchRecords } = useQuery(GET_WEBSITE_RECORDS);
  const { data: pageData, refetch } = useQuery(GET_PAGES, {
    variables: { website_record_id: selectedRecordId },
    skip: selectedRecordId === null,
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  });

  const pages = pageData?.pages || [];

  const handleModeChange = async (e) => {
    const newMode = e.target.value;
    setMode(newMode);

    if (!selectedRecordId) return;

    await fetch(`/api/website-records/${selectedRecordId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    active: String(newMode === CrawlMode.ACTIVE),
    interval_seconds: intervalSeconds,
    depth: parseInt(depth || "1"),
    pattern: pattern || ".*",
  }),
}).then(res => res.json())
      .then(data => {
        console.log("📝 PATCH response:", data);
      });

    const should = newMode === CrawlMode.ACTIVE;
    console.log("🔄 Mode updated to:", newMode);
    console.log("📶 shouldPoll set to", should);
    setShouldPoll(should);

    await refetchRecords();

    // ✅ 立即触发一次轮询（不用等 interval）
    if (should) {
      setPollCount(prev => prev + 1);
      await refetch({ website_record_id: selectedRecordId });
    }
  };

  const nodes = useMemo(() => {
    if (pages.length === 0) return [{ id: 'root', text: 'No Data', opacity: 0 }];
    return pages.map(p => ({
      id: String(p._id),
      text: String(p.title || p.url || `Page ${p._id}`),
    }));
  }, [pages]);

  const lines = useMemo(() =>
    pages
      .filter(p => p.from_id != null)
      .map(p => ({
        from: String(p.from_id),
        to: String(p._id),
      })), [pages]);

  const pageDetail = useMemo(() =>
    pages.find(p => p._id === selectedNodeId), [pages, selectedNodeId]);

  useEffect(() => {
    console.log("👁️‍🗨️ shouldPoll changed to", shouldPoll);
  }, [shouldPoll]);

  useEffect(() => {
    if (recordsData?.website_records?.length > 0 && !selectedRecordId) {
      setSelectedRecordId(recordsData.website_records[0].id);
    }
  }, [recordsData]);

  useEffect(() => {
    if (!selectedRecordId || !shouldPoll) return;

    const timer = setInterval(() => {
      setPollCount(prev => {
        const next = prev + 1;
        console.log(`🔁 [Polling #${next}] Refetching for record:`, selectedRecordId);
        return next;
      });

      refetch({ website_record_id: String(selectedRecordId) }).then(res => {
        console.log(`📥 [Polling Result] Pages received:`, res.data.pages?.length);
        console.log(res.data.pages);
      }).catch(err => {
        console.error("❌ Refetch error:", err);
      });
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [selectedRecordId, shouldPoll, intervalSeconds]);

  useEffect(() => {
    if (pageData?.pages) {
      console.log("🧩 pageData updated:", pageData.pages.length, "pages");
    }
  }, [pageData]);

  useEffect(() => {
    if (selectedRecordId) {
      console.log("📡 Refetching for record:", selectedRecordId);
      setPollCount(0);
      refetch({ website_record_id: selectedRecordId });
    }
  }, [selectedRecordId]);

  useEffect(() => {
    const graphInstance = graphRef.current?.getInstance?.();

    if (graphInstance && pages.length > 0) {
      console.log("🎨 [UI Refresh] Updating graph");
      console.log("📊 Nodes:", nodes);
      console.log("🔗 Lines:", lines);

      graphInstance.clearData?.();
      graphInstance.setJsonData({ nodes: [...nodes], lines: [...lines] });
      graphInstance.refresh?.();
      graphInstance.relayout?.();
      graphInstance.zoomToFit?.();
    }
  }, [pages]);  // ✅ 依赖 pages，不是 pollCount！

  const handleStartCrawling = async () => {
    const createRes = await fetch("/api/website-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        label: `Auto ${new Date().toISOString()}`,
        regexp: pattern || ".*",
        periodicity: `${intervalSeconds}`, // 改成秒数字符串
        active: true,
        tags: [],
      }),
    });

    const newRecord = await createRes.json();
    const newId = newRecord.id;

    await refetchRecords();
    setSelectedRecordId(newId);

    await fetch("/api/crawl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        url,
        depth: parseInt(depth || "1"),
        pattern: pattern || ".*",
        website_record_id: newId,
        interval_seconds: intervalSeconds,
      }),
    });

    console.log("🚀 Crawling started...");

    setTimeout(() => {
      refetch({ website_record_id: newId });
    }, 8000);
  };

  return (
    <>
      <div className="p-4">
        <div className="text-3xl font-bold mb-4">🌐 Tony's Web Crawler</div>
        <Space vertical spacing="loose" align="start">
          <RadioGroup type="button" value={mode} onChange={handleModeChange}>
            <Radio value={CrawlMode.ACTIVE}>Active</Radio>
            <Radio value={CrawlMode.INACTIVE}>Inactive</Radio>
          </RadioGroup>

          <Select
            value={selectedRecordId}
            onChange={(id) => setSelectedRecordId(id)}
            placeholder="Select a record"
            style={{ width: 320 }}
          >
            {(recordsData?.website_records || []).map(r => (
              <Select.Option key={r.id} value={r.id}>
                {r.label}
              </Select.Option>
            ))}
          </Select>

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

          <Button onClick={handleStartCrawling} type="primary">
            🚀 Start Crawling
          </Button>

          <Button onClick={() => refetch({ website_record_id: selectedRecordId })}>
            🔄 Refresh
          </Button>

          <div>🔁 Polling Count: {pollCount}</div>
        </Space>

        <div className="w-full border mt-4" style={{ height: '70vh' }}>
          <RelationGraph
            key={selectedRecordId + '-' + pollCount}
            ref={graphRef}
            options={{
              defaultNodeBorderWidth: 0,
              defaultNodeColor: '#78c8e2',
              defaultLineShape: 1,
              layouts: [{ layoutName: 'center' }],
              defaultJunctionPoint: 'border',
            }}
            onNodeClick={node => {
              setSelectedNodeId(node.id);
              setVisible(true);
            }}
          />
        </div>
      </div>

      <SideSheet title="Page Detail" visible={visible} onCancel={() => setVisible(false)}>
        {pageDetail && (
          <>
            <Title>{pageDetail.title}</Title>
            <div>{pageDetail.url}</div>
            <div>{pageDetail.time?.slice(0, 19)}</div>
            <List
              header="Links"
              dataSource={pageDetail.links}
              renderItem={item => <List.Item>{item}</List.Item>}
            />
          </>
        )}
      </SideSheet>
    </>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Index />
    </ApolloProvider>
  );
}