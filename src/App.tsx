import { useCallback, useMemo, useState, type DragEvent } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node
} from 'reactflow';
import { create } from 'zustand';
import { InputNode, GenerationNode, OutputNode } from './components/nodes';
import { NodeSidebar } from './components/NodeSidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import 'reactflow/dist/style.css';

type HistoryStore = {
  history: string[];
  push: (json: string) => void;
};

const useHistoryStore = create<HistoryStore>((set) => ({
  history: [],
  push: (json) => set((state) => ({ history: [...state.history, json] }))
}));

const nodeTypes = {
  inputNode: InputNode,
  generationNode: GenerationNode,
  outputNode: OutputNode
};

const initialNodes: Node[] = [
  {
    id: 'n-input',
    type: 'inputNode',
    position: { x: 100, y: 180 },
    data: { label: 'Image Upload', subtitle: 'INPUT', preview: 'IMG_2301.png' }
  },
  {
    id: 'n-gen',
    type: 'generationNode',
    position: { x: 460, y: 180 },
    data: { label: 'KSampler Advanced', subtitle: 'GENERATION' }
  },
  {
    id: 'n-output',
    type: 'outputNode',
    position: { x: 820, y: 180 },
    data: { label: 'Preview', subtitle: 'OUTPUT', preview: 'Awaiting execution' }
  }
];

const initialEdges: Edge[] = [
  {
    id: 'e-in-gen',
    source: 'n-input',
    target: 'n-gen',
    sourceHandle: 'image',
    targetHandle: 'latent',
    animated: true,
    style: { stroke: '#7b5dff', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#bd00ff' }
  },
  {
    id: 'e-gen-out',
    source: 'n-gen',
    target: 'n-output',
    sourceHandle: 'image',
    targetHandle: 'image',
    animated: true,
    style: { stroke: '#ff336f', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ff0040' }
  }
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const pushHistory = useHistoryStore((state) => state.push);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  const snapshot = useCallback(
    (nextNodes: Node[], nextEdges: Edge[]) => {
      const payload = {
        generated_at: new Date().toISOString(),
        workflow: {
          nodes: nextNodes.map((node) => ({
            id: node.id,
            type: node.type,
            category: String(node.data?.subtitle ?? 'UTILITY'),
            pos_x: node.position.x,
            pos_y: node.position.y,
            inputs: [],
            outputs: [],
            params: node.data,
            execution_code: `execution_code.${node.type}`
          })),
          edges: nextEdges
        }
      };
      pushHistory(JSON.stringify(payload));
      return JSON.stringify(payload, null, 2);
    },
    [pushHistory]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) {
        return;
      }

      const sourceType = String(sourceNode.data?.subtitle ?? '');
      const targetType = String(targetNode.data?.subtitle ?? '');
      const invalid = sourceType === 'INPUT' && targetType === 'OUTPUT';

      if (invalid) {
        alert('Invalid link: connect INPUT to GENERATION before OUTPUT.');
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'default',
            animated: true,
            style: { stroke: '#8e7dff', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#8e7dff' }
          },
          eds
        )
      );
    },
    [nodes, setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };

      const node: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: type === 'inputNode' ? 'Prompt Text' : type === 'generationNode' ? 'ControlNet' : 'Save Image',
          subtitle: type === 'inputNode' ? 'INPUT' : type === 'generationNode' ? 'GENERATION' : 'OUTPUT'
        }
      };

      setNodes((nds) => nds.concat(node));
    },
    [setNodes]
  );

  const exportJson = () => {
    const json = snapshot(nodes, edges);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nodecanvas-pro-workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const edgeOptions = useMemo(
    () => ({
      type: 'default',
      animated: true,
      style: { stroke: '#6f6af8', strokeWidth: 2 }
    }),
    []
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <strong>NodeCanvas Pro</strong>
          <span className="muted">Workflow / Cinematic / v0.1</span>
        </div>
        <div className="topbar-actions">
          <button>▶ Execute</button>
          <button>⏸ Pause</button>
          <button onClick={exportJson}>Export JSON</button>
        </div>
      </header>
      <div className="layout">
        <NodeSidebar />
        <main className="canvas-wrap">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            minZoom={0.1}
            maxZoom={4}
            defaultEdgeOptions={edgeOptions}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            deleteKeyCode="Delete"
            panOnScroll
            selectionOnDrag
            panOnDrag={[1, 2]}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#1a1a1a" />
            <Controls position="bottom-right" showInteractive={false} />
          </ReactFlow>
        </main>
        <PropertiesPanel selectedNode={selectedNode} />
      </div>
    </div>
  );
}
