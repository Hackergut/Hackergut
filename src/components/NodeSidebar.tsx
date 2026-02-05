import type React from 'react';

const LIBRARY = [
  { type: 'inputNode', label: 'Prompt Text', category: 'Load', accent: '#00d9ff' },
  { type: 'generationNode', label: 'KSampler Advanced', category: 'Generation', accent: '#bd00ff' },
  { type: 'outputNode', label: 'Preview Output', category: 'Output', accent: '#ff0040' }
];

export function NodeSidebar() {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="left-sidebar">
      <h2>Node Library</h2>
      <p className="muted">Drag nodes into the canvas</p>
      <div className="library-grid">
        {LIBRARY.map((item) => (
          <div
            key={item.label}
            draggable
            onDragStart={(event) => onDragStart(event, item.type)}
            className="library-card"
          >
            <span className="dot" style={{ background: item.accent }} />
            <div>
              <strong>{item.label}</strong>
              <p>{item.category}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
