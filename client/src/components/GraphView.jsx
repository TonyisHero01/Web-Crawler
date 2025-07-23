import { useEffect } from 'react';
import RelationGraph from 'relation-graph-react';

export default function GraphView({ graphRef, nodes, lines, selectedRecordId, pollCount, onNodeClick }) {
  useEffect(() => {
    const graphInstance = graphRef.current?.getInstance?.();

    if (graphInstance && nodes.length > 0) {
      console.log("🎨 [UI Refresh] Updating graph");
      console.log("📊 Nodes:", nodes);
      console.log("🔗 Lines:", lines);

      graphInstance.clearData?.();
      graphInstance.setJsonData({ nodes: [...nodes], lines: [...lines] });
      graphInstance.refresh?.();
      graphInstance.relayout?.();
      graphInstance.zoomToFit?.();
    }
  }, [nodes, lines, graphRef]);

  return (
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
        onNodeClick={onNodeClick}
      />
    </div>
  );
}