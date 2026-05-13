import { useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Position,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Icon } from './icons.jsx';
import { useTheme, useTokenColor } from '../theme.jsx';

// Node-kind hues. Use theme tokens so the indicators read correctly in both
// modes (GitHub's light green / red are noticeably more saturated than dark).
const KIND_STYLES = {
  entry:      { ring: 'rgb(var(--gh-success))',   label: 'entry' },
  processing: { ring: 'rgb(var(--gh-accent))',    label: 'processing' },
  storage:    { ring: 'rgb(var(--gh-done))',      label: 'storage' },
  external:   { ring: 'rgb(var(--gh-danger))',    label: 'external' },
};

function FlowNode({ data, selected }) {
  const s = KIND_STYLES[data.kind] ?? KIND_STYLES.processing;
  return (
    <div
      className="rounded-md min-w-[170px] bg-gh-overlay border transition shadow-elev"
      style={{
        borderColor: selected ? s.ring : 'rgb(var(--gh-border))',
        boxShadow: selected ? `0 0 0 2px ${s.ring}` : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: s.ring, width: 6, height: 6, border: 'none' }} />
      <div className="px-3 py-1.5 border-b border-gh-border flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.ring }} />
        <span className="text-[10px] uppercase tracking-wider text-gh-fg-muted">{s.label}</span>
      </div>
      <div className="px-3 py-2">
        <div className="text-[13px] font-semibold text-gh-fg leading-tight">{data.label}</div>
        {data.file && (
          <div className="text-[11px] text-gh-fg-muted font-mono mt-1 truncate max-w-[220px]">
            {data.file}{data.line ? `:${data.line}` : ''}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: s.ring, width: 6, height: 6, border: 'none' }} />
    </div>
  );
}

const nodeTypes = { flow: FlowNode };

function layoutNodes(nodes) {
  const order = { entry: 0, processing: 1, storage: 2, external: 2 };
  const byCol = { 0: [], 1: [], 2: [] };
  for (const n of nodes) byCol[order[n.kind] ?? 1].push(n);
  const colX = [60, 360, 700];
  const result = [];
  for (const [col, items] of Object.entries(byCol)) {
    const x = colX[col];
    const total = items.length;
    items.forEach((n, i) => {
      const y = 120 + i * 110 - (total - 1) * 55;
      result.push({
        id: n.id,
        type: 'flow',
        position: { x, y },
        data: { ...n },
      });
    });
  }
  return result;
}

export function DataFlowGraph({ result, onSelectViolation }) {
  const [selected, setSelected] = useState(null);
  // React Flow's <Background color> goes onto an SVG fill attribute, which
  // doesn't reliably evaluate `var(--…)`. Resolve to a concrete colour string
  // so it tracks theme correctly. useTokenColor re-computes when theme flips.
  const bgDotColor = useTokenColor('border');
  const okEdgeColor = useTokenColor('border');
  const dangerColor = useTokenColor('danger');
  const fgMutedColor = useTokenColor('fg-muted');
  const canvasInsetColor = useTokenColor('canvas-inset');
  // eslint-disable-next-line no-unused-vars
  const { theme } = useTheme();

  const { nodes, edges } = useMemo(() => {
    const df = result.dataFlow ?? { nodes: [], edges: [] };
    const nodes = layoutNodes(df.nodes);
    const violationByEdge = new Map();
    for (const v of result.violations ?? []) {
      if (v.dataFlowEdgeId) violationByEdge.set(v.dataFlowEdgeId, v.id);
    }
    const edges = (df.edges ?? []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.violation,
      className: e.violation ? 'cg-edge-violation' : 'cg-edge-ok',
      labelStyle: { fill: e.violation ? dangerColor : fgMutedColor, fontSize: 11, fontWeight: 500 },
      labelBgStyle: { fill: canvasInsetColor, fillOpacity: 0.95 },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.violation ? dangerColor : okEdgeColor,
      },
      data: { violation: e.violation, violationId: violationByEdge.get(e.id) },
    }));
    return { nodes, edges };
  }, [result, dangerColor, fgMutedColor, canvasInsetColor, okEdgeColor]);

  const selectedNode = nodes.find((n) => n.id === selected);
  const personalById = new Map((result.personalData ?? []).map((p) => [p.id, p]));

  return (
    <div className="gh-panel overflow-hidden">
      <div className="gh-section-header">
        <div className="flex items-center gap-2">
          <Icon.Graph className="w-4 h-4 text-gh-fg-muted" />
          <span className="text-gh-fg font-semibold text-sm">Data flow</span>
          <span className="text-gh-fg-muted">·</span>
          <span className="text-gh-fg-muted">how personal data moves through the code</span>
        </div>
        <Legend />
      </div>

      <div className="h-[440px] relative bg-gh-canvas-inset">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => setSelected(node.id)}
          onEdgeClick={(_, edge) => {
            if (edge.data?.violationId) onSelectViolation?.(edge.data.violationId);
          }}
          onPaneClick={() => setSelected(null)}
        >
          <Background gap={20} size={1} color={bgDotColor} />
          <Controls showInteractive={false} />
        </ReactFlow>

        {selectedNode && (
          <div className="absolute top-3 right-3 w-72 gh-panel bg-gh-overlay/95 shadow-elev">
            <div className="gh-section-header">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: KIND_STYLES[selectedNode.data.kind]?.ring }} />
                <span className="text-gh-fg-muted text-[11px] uppercase tracking-wider">
                  {KIND_STYLES[selectedNode.data.kind]?.label} node
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="text-gh-fg-muted hover:text-gh-fg">
                <Icon.X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-3 py-3">
              <div className="text-[13px] font-semibold text-gh-fg">{selectedNode.data.label}</div>
              {selectedNode.data.file && (
                <div className="text-[11px] text-gh-fg-muted font-mono mt-1">
                  {selectedNode.data.file}{selectedNode.data.line ? `:${selectedNode.data.line}` : ''}
                </div>
              )}
              <div className="text-[10px] uppercase tracking-wider text-gh-fg-muted mt-3">
                Personal data
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(selectedNode.data.carries?.length ? selectedNode.data.carries : ['—']).map((id) => {
                  const p = personalById.get(id);
                  return (
                    <span key={id} className="gh-label border-gh-border bg-gh-subtle text-gh-fg">
                      {p ? p.label : id}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="hidden md:flex items-center gap-3 text-[11px] text-gh-fg-muted">
      {Object.entries(KIND_STYLES).map(([k, v]) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: v.ring }} />
          {v.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5 pl-3 ml-1 border-l border-gh-border">
        <span className="inline-block w-4 h-[1.5px] border-t border-dashed border-gh-danger" />
        violating edge
      </span>
    </div>
  );
}
