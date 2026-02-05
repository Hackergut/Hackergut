import { Handle, Position } from 'reactflow';

type NodeData = {
  label: string;
  subtitle: string;
  preview?: string;
};

const baseClass = 'custom-node';

export function InputNode({ data }: { data: NodeData }) {
  return (
    <div className={`${baseClass} node-input`}>
      <header>
        <p className="node-title">{data.label}</p>
        <span>{data.subtitle}</span>
      </header>
      <div className="node-preview">{data.preview ?? 'No input selected'}</div>
      <Handle type="source" position={Position.Right} id="image" />
    </div>
  );
}

export function GenerationNode({ data }: { data: NodeData }) {
  return (
    <div className={`${baseClass} node-generation`}>
      <Handle type="target" position={Position.Left} id="latent" />
      <header>
        <p className="node-title">{data.label}</p>
        <span>{data.subtitle}</span>
      </header>
      <div className="node-preview">KSampler • 28 steps • CFG 7.5</div>
      <Handle type="source" position={Position.Right} id="image" />
    </div>
  );
}

export function OutputNode({ data }: { data: NodeData }) {
  return (
    <div className={`${baseClass} node-output`}>
      <Handle type="target" position={Position.Left} id="image" />
      <header>
        <p className="node-title">{data.label}</p>
        <span>{data.subtitle}</span>
      </header>
      <div className="node-preview">{data.preview ?? 'Preview stream idle'}</div>
    </div>
  );
}
