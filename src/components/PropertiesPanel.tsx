import type { Node } from 'reactflow';

type Props = {
  selectedNode?: Node;
};

export function PropertiesPanel({ selectedNode }: Props) {
  return (
    <aside className={`right-sidebar ${selectedNode ? 'open' : ''}`}>
      {selectedNode ? (
        <>
          <h3>{String(selectedNode.data?.label ?? selectedNode.id)}</h3>
          <p className="muted">{selectedNode.type}</p>
          <div className="property-item">
            <label>Node ID</label>
            <code>{selectedNode.id}</code>
          </div>
          <div className="property-item">
            <label>Position</label>
            <code>
              {Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)}
            </code>
          </div>
          <div className="property-item">
            <label>Execution</label>
            <code>{`execution_code.${selectedNode.type}`}</code>
          </div>
        </>
      ) : (
        <p className="muted">Select a node to inspect parameters</p>
      )}
    </aside>
  );
}
