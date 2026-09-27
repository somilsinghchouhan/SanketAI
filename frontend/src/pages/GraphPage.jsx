import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Network,
  Search,
  Maximize2,
  Minimize2,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
  X
} from 'lucide-react';
import { graphService } from '../services/graphService.js';
import { entityService } from '../services/entityService.js';
import { relationshipService } from '../services/relationshipService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import FindingsPanel from '../components/findings/FindingsPanel.jsx';
import EntityDossier from '../components/dossier/EntityDossier.jsx';
import EntityNode from '../components/graph/EntityNode.jsx';

const nodeTypes = { entity: EntityNode };

function layout(backendNodes) {
  const grouped = {};
  backendNodes.forEach((n) => {
    const t = n.type || 'OTHER';
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(n);
  });
  const types = Object.keys(grouped);
  const nodes = [];
  types.forEach((type, col) => {
    grouped[type].forEach((n, row) => {
      nodes.push({
        id: n.id,
        type: 'entity',
        position: { x: col * 280, y: row * 130 },
        data: {
          label: n.label || n.id,
          type: n.type,
          risk: n.risk,
          severity: n.severity,
        },
      });
    });
  });
  return nodes;
}

export default function GraphPage() {
  const { caseId } = useParams();
  const { selectedEntity, setSelectedEntity, currentCase, refreshKey } = useInvestigation();
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [nodeSearch, setNodeSearch] = useState('');

  const graph = useAsyncResource(() => graphService.getGraph(caseId), [caseId, refreshKey]);
  const anomalies = useAsyncResource(() => relationshipService.getAnomalies(caseId), [caseId, refreshKey]);

  const rfNodes = useMemo(() => {
    if (!graph.data?.nodes) return [];
    const all = layout(graph.data.nodes);
    if (!nodeSearch.trim()) return all;
    const q = nodeSearch.toLowerCase();
    return all.map((node) => ({
      ...node,
      selected:
        node.id.toLowerCase().includes(q) ||
        (node.data?.label && node.data.label.toLowerCase().includes(q)),
    }));
  }, [graph.data, nodeSearch]);

  const rfEdges = useMemo(
    () =>
      (graph.data?.edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: '#3b82f6',
        },
        style: { stroke: '#94a3b8', strokeWidth: 1.5 },
        data: e,
      })),
    [graph.data]
  );

  const onNodeClick = useCallback(
    async (_evt, node) => {
      setSelectedEdge(null);
      try {
        const dossier = await entityService.getEntityDossier(caseId, node.id);
        setSelectedEntity(dossier);
      } catch {
        setSelectedEntity(node.data ? { id: node.id, ...node.data, score: node.data.risk } : null);
      }
    },
    [caseId, setSelectedEntity]
  );

  const onEdgeClick = useCallback((_evt, edge) => {
    setSelectedEdge(edge.data || edge);
  }, []);

  if (graph.loading) return <LoadingSpinner text="Constructing ReactFlow topological graph..." />;
  if (graph.error) return <ErrorState message={graph.error} onRetry={graph.reload} />;

  const analyzed = String(currentCase?.status || '').toUpperCase() === 'ANALYZED';
  const hasGraph = (graph.data?.nodes || []).length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Investigation Network Graph"
        subtitle="Interactive topological intelligence graph visualising connected entities, communication paths, and anomalous fund routing."
        badge={`${graph.data?.nodes?.length || 0} Nodes · ${graph.data?.edges?.length || 0} Edges`}
        badgeType="info"
      />

      {/* Anomalies / Findings Bar */}
      <FindingsPanel
        analyzed={analyzed}
        findings={anomalies.data || []}
        loading={anomalies.loading}
      />

      {!hasGraph ? (
        <EmptyState
          icon={Network}
          title="No Topological Graph Data"
          description="Upload evidence files and run forensic analysis. The topological graph will map entities, funds flow, and shared infrastructure."
        />
      ) : (
        <div className="space-y-4">
          {/* Graph Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-3.5 flex flex-wrap items-center justify-between gap-3">
            {/* Quick Node Search */}
            <div className="relative w-72 max-w-full">
              <input
                type="text"
                placeholder="Highlight node on graph..."
                value={nodeSearch}
                onChange={(e) => setNodeSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category Legend */}
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Phone
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Account
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> UPI
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> IP
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> IMEI/MAC
              </span>
            </div>
          </div>

          {/* Interactive ReactFlow Container + Side Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className={`h-[680px] bg-slate-50 border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm relative ${
              selectedEntity || selectedEdge ? 'xl:col-span-8' : 'xl:col-span-12'
            }`}>
              <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                fitView
                minZoom={0.15}
                maxZoom={2.0}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#cbd5e1" gap={20} size={1} />
                <Controls
                  showInteractive={false}
                  className="!border !border-slate-200 !rounded-xl !overflow-hidden !shadow-md !bg-white"
                />
                <MiniMap
                  nodeStrokeWidth={2}
                  nodeColor={(n) => (n.selected ? '#2563eb' : '#0f172a')}
                  maskColor="rgba(248, 250, 252, 0.75)"
                  className="!border !border-slate-200 !rounded-xl !overflow-hidden !shadow-sm !bg-white"
                />
              </ReactFlow>
            </div>

            {/* Right Inspector Panel */}
            {(selectedEntity || selectedEdge) && (
              <aside className="xl:col-span-4 space-y-4 sticky top-24 self-start">
                {/* Edge Inspector Card */}
                {selectedEdge && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 text-xs">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                        <span>Link Inspector</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedEdge(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <dl className="space-y-2">
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-400 font-medium">Type</dt>
                        <dd className="font-mono font-bold text-slate-900">
                          {selectedEdge.type || 'TRANSFER'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-400 font-medium">Annotation</dt>
                        <dd className="font-mono text-slate-700 truncate">
                          {selectedEdge.label || '—'}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-100">
                        <dt className="text-slate-400 font-medium">Source</dt>
                        <dd className="font-mono font-bold text-slate-900 truncate">
                          {selectedEdge.source}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-100">
                        <dt className="text-slate-400 font-medium">Target</dt>
                        <dd className="font-mono font-bold text-slate-900 truncate">
                          {selectedEdge.target}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}

                {/* Node Dossier Card */}
                {selectedEntity && (
                  <EntityDossier
                    entity={selectedEntity}
                    caseId={caseId}
                    onClose={() => setSelectedEntity(null)}
                  />
                )}
              </aside>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
