import { useEffect, useMemo, useRef, useState } from 'react';
import { GET_PAGES, GET_WEBSITE_RECORDS } from '../graphql/queries';
import { useQuery } from '@apollo/client';
import { prepareGraphData } from '../utils/graphUtils';
import { startNewCrawl } from '../services/crawlService';
import { CrawlMode } from '../constants';

export default function useCrawlerManager() {
  const [crawlMode, setCrawlMode] = useState(CrawlMode.INACTIVE);
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState('');
  const [pattern, setPattern] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [pollRequestCount, setPollRequestCount] = useState(0);
  const [shouldAutoPoll, setShouldAutoPoll] = useState(false);
  const graphRef = useRef(null);

  const { data: recordsData, refetch: refetchRecords } = useQuery(GET_WEBSITE_RECORDS);
  const { data: pageData, refetch } = useQuery(GET_PAGES, {
    variables: { website_record_id: selectedRecordId },
    skip: selectedRecordId === null,
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  });

  const pages = pageData?.pages || [];
  const { nodes, lines } = useMemo(() => prepareGraphData(pages), [pages]);
  const pageDetail = useMemo(() => pages.find(p => p._id === selectedPageId), [pages, selectedPageId]);

  useEffect(() => {
    if (recordsData?.website_records?.length > 0 && !selectedRecordId) {
      setSelectedRecordId(recordsData.website_records[0].id);
    }
  }, [recordsData]);

  useEffect(() => {
    if (!selectedRecordId || !shouldAutoPoll) return;

    const timer = setInterval(() => {
      setPollRequestCount(prev => prev + 1);
      refetch({ website_record_id: selectedRecordId });
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [selectedRecordId, shouldAutoPoll, intervalSeconds]);

  useEffect(() => {
    const graphInstance = graphRef.current?.getInstance?.();

    if (graphInstance && pages.length > 0) {
      graphInstance.clearData?.();
      graphInstance.setJsonData({ nodes: [...nodes], lines: [...lines] });
      graphInstance.refresh?.();
      graphInstance.relayout?.();
      graphInstance.zoomToFit?.();
    }
  }, [pages]);

  const handleModeChange = async (e) => {
    const newMode = e.target.value;
    setCrawlMode(newMode);

    if (!selectedRecordId) return;

    await fetch(`/api/website-records/${selectedRecordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        active: String(newMode === CrawlMode.ACTIVE),
        interval_seconds: intervalSeconds,
        depth: parseInt(depth || '1'),
        pattern: pattern || '.*',
      }),
    });

    const should = newMode === CrawlMode.ACTIVE;
    setShouldAutoPoll(should);
    await refetchRecords();

    if (should) {
      setPollRequestCount(prev => prev + 1);
      await refetch({ website_record_id: selectedRecordId });
    }
  };

  const handleStartCrawling = async () => {
    const newId = await startNewCrawl({
      url,
      depth,
      pattern,
      intervalSeconds,
      mode: crawlMode,
    });

    await refetchRecords();
    setSelectedRecordId(newId);
    setTimeout(() => {
      refetch({ website_record_id: newId });
    }, 8000);
  };

  return {
    crawlMode, setCrawlMode,
    url, setUrl,
    depth, setDepth,
    pattern, setPattern,
    intervalSeconds, setIntervalSeconds,
    selectedRecordId, setSelectedRecordId,
    selectedPageId, setSelectedPageId,
    pollRequestCount,
    shouldAutoPoll,
    graphRef,
    recordsData,
    nodes, lines,
    pageDetail,
    visibleState: useState(false),
    handleModeChange,
    handleStartCrawling,
    refetch,
  };
}