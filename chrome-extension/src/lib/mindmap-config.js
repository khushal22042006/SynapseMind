// chrome-extension/src/lib/mindmap-config.js
// Configuration for mind map visualization

export const mindMapConfig = {
  // Node types configuration
  nodeTypes: {
    main: {
      background: '#4F46E5',
      color: '#FFFFFF',
      border: '#4338CA',
      size: 120,
      fontSize: 16,
      fontWeight: 'bold'
    },
    sub: {
      background: '#3B82F6',
      color: '#FFFFFF',
      border: '#2563EB',
      size: 100,
      fontSize: 14,
      fontWeight: '600'
    },
    detail: {
      background: '#6B7280',
      color: '#FFFFFF',
      border: '#4B5563',
      size: 80,
      fontSize: 12,
      fontWeight: 'normal'
    },
    default: {
      background: '#9CA3AF',
      color: '#FFFFFF',
      border: '#6B7280',
      size: 90,
      fontSize: 13,
      fontWeight: '500'
    }
  },

  // Edge types configuration
  edgeTypes: {
    default: {
      stroke: '#9CA3AF',
      strokeWidth: 2,
      strokeDasharray: 'none'
    },
    strong: {
      stroke: '#4F46E5',
      strokeWidth: 3,
      strokeDasharray: 'none'
    },
    weak: {
      stroke: '#D1D5DB',
      strokeWidth: 1,
      strokeDasharray: '5,5'
    }
  },

  // Layout configuration
  layout: {
    spacing: {
      horizontal: 200,
      vertical: 100
    },
    orientation: 'horizontal', // 'horizontal' or 'vertical'
    direction: 'LR' // LR, RL, TB, BT
  },

  // Zoom configuration
  zoom: {
    min: 0.1,
    max: 2,
    default: 0.8
  },

  // Interaction configuration
  interaction: {
    panOnScroll: true,
    panOnDrag: true,
    zoomOnScroll: true,
    zoomOnDoubleClick: true,
    dragNodes: true,
    dragEdges: false
  },

  // Style configuration
  style: {
    backgroundColor: '#F9FAFB',
    nodeBorderRadius: 8,
    nodePadding: 16,
    edgeLabelOffset: 10
  },

  // Helper functions
  getNodeStyle: (type = 'default') => {
    const config = mindMapConfig.nodeTypes[type] || mindMapConfig.nodeTypes.default;
    return {
      background: config.background,
      color: config.color,
      border: `2px solid ${config.border}`,
      borderRadius: mindMapConfig.style.nodeBorderRadius,
      padding: mindMapConfig.style.nodePadding,
      width: config.size,
      height: config.size,
      fontSize: config.fontSize,
      fontWeight: config.fontWeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  },

  getEdgeStyle: (type = 'default') => {
    const config = mindMapConfig.edgeTypes[type] || mindMapConfig.edgeTypes.default;
    return {
      stroke: config.stroke,
      strokeWidth: config.strokeWidth,
      strokeDasharray: config.strokeDasharray
    };
  },

  // Generate initial positions for nodes (simple grid layout)
  generatePositions: (nodes) => {
    const positions = {};
    const centerX = 400;
    const centerY = 300;
    
    nodes.forEach((node, index) => {
      if (node.type === 'main') {
        positions[node.id] = { x: centerX, y: centerY };
      } else if (node.type === 'sub') {
        const angle = (index * 2 * Math.PI) / nodes.filter(n => n.type === 'sub').length;
        const radius = 200;
        positions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      } else {
        // Position details around their parent nodes
        const parentNode = nodes.find(n => n.type === 'sub') || nodes[0];
        const parentPos = positions[parentNode.id] || { x: centerX + 100, y: centerY + 100 };
        positions[node.id] = {
          x: parentPos.x + (index % 3) * 150 - 150,
          y: parentPos.y + Math.floor(index / 3) * 100 + 100
        };
      }
    });
    
    return positions;
  }
};

export default mindMapConfig;