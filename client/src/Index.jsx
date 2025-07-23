import useCrawlerManager from './hooks/useCrawlerManager';
import useCrawlSocket from './hooks/useCrawlSocket';
import { Space } from '@douyinfe/semi-ui';

import ModeToggle from './components/ModeToggle';
import RecordSelector from './components/RecordSelector';
import ControlPanel from './components/ControlPanel';
import GraphView from './components/GraphView';
import PageDetailSheet from './components/PageDetailSheet';

export default function Index() {
  const {
    crawlMode, handleModeChange,
    url, setUrl,
    depth, setDepth,
    pattern, setPattern,
    intervalSeconds, setIntervalSeconds,
    selectedRecordId, setSelectedRecordId,
    selectedPageId, setSelectedPageId,
    pollRequestCount,
    graphRef,
    recordsData, nodes, lines, pageDetail,
    visibleState,
    handleStartCrawling,
    refetch,
  } = useCrawlerManager();

  const [visible, setVisible] = visibleState;

  useCrawlSocket({
    onComplete: (id) => {
      if (id === selectedRecordId) {
        refetch({ website_record_id: id });
      }
    },
  });

  return (
    <>
      <div className="p-4">
        <div className="text-3xl font-bold mb-4">🌐 Tony's Web Crawler</div>
        <Space vertical spacing="loose" align="start">
          <ModeToggle mode={crawlMode} onChange={handleModeChange} />
          <RecordSelector
            records={recordsData?.website_records}
            selectedId={selectedRecordId}
            onChange={setSelectedRecordId}
          />
          <ControlPanel
            url={url} setUrl={setUrl}
            depth={depth} setDepth={setDepth}
            pattern={pattern} setPattern={setPattern}
            intervalSeconds={intervalSeconds} setIntervalSeconds={setIntervalSeconds}
            onStartCrawling={handleStartCrawling}
            onRefresh={() => refetch({ website_record_id: selectedRecordId })}
            pollCount={pollRequestCount}
          />
        </Space>

        <GraphView
          graphRef={graphRef}
          nodes={nodes}
          lines={lines}
          selectedRecordId={selectedRecordId}
          pollCount={pollRequestCount}
          onNodeClick={(node) => {
            setSelectedPageId(node.id);
            setVisible(true);
          }}
        />
      </div>

      <PageDetailSheet
        visible={visible}
        onClose={() => setVisible(false)}
        pageDetail={pageDetail}
      />
    </>
  );
}