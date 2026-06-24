// ===================================
// GRAPH.JS - Knowledge Graph Visualization
// ===================================

let network = null;
let nodes = null;
let edges = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeGraph();
    generateGraph();
});

// ===================================
// INITIALIZE GRAPH
// ===================================

function initializeGraph() {
    const generateGraphBtn = document.getElementById('generateGraphBtn');
    if (generateGraphBtn) {
        generateGraphBtn.addEventListener('click', generateGraph);
    }
}

// ===================================
// GENERATE GRAPH
// ===================================

async function generateGraph() {
    try {
        showLoading(true);

        const subject = document.getElementById('subjectFilter')?.value;
        const nodeType = document.getElementById('nodeType')?.value || 'all';

        const queryParams = new URLSearchParams();
        if (subject) queryParams.append('subject', subject);
        queryParams.append('nodeType', nodeType);

        const data = await fetchAPI(`/graph?${queryParams}`);

        if (data && data.success) {
            visualizeGraph(data.data.nodes, data.data.edges);
            updateGraphStats(data.data);
        }
    } catch (error) {
        console.error('Error generating graph:', error);
        showToast('Failed to generate graph', 'danger', 'Error');
    } finally {
        showLoading(false);
    }
}

// ===================================
// VISUALIZE GRAPH
// ===================================

function visualizeGraph(nodesData, edgesData) {
    const container = document.getElementById('graphContainer');
    if (!container) return;

    // Prepare nodes
    nodes = new vis.DataSet(nodesData.map(node => ({
        id: node.id,
        label: node.label,
        title: node.title || node.label,
        color: getNodeColor(node.type),
        shape: getNodeShape(node.type),
        font: { color: 'white', size: 14 },
        borderWidth: 2
    })));

    // Prepare edges
    edges = new vis.DataSet(edgesData.map(edge => ({
        from: edge.from,
        to: edge.to,
        color: { color: 'rgba(255, 255, 255, 0.3)' },
        width: edge.weight || 2
    })));

    const data = { nodes, edges };

    const options = {
        physics: {
            enabled: true,
            stabilization: {
                iterations: 200
            },
            barnesHut: {
                gravitationalConstant: -26000,
                centralGravity: 0.005,
                springLength: 200
            }
        },
        interaction: {
            navigationButtons: true,
            keyboard: true,
            hover: true,
            zoomView: true,
            dragView: true
        }
    };

    network = new vis.Network(container, data, options);

    // Click event
    network.on('click', (params) => {
        if (params.nodes.length > 0) {
            showNodeDetails(params.nodes[0]);
        }
    });

    // Hover event
    network.on('hoverNode', (params) => {
        container.style.cursor = 'pointer';
    });

    network.on('blurNode', () => {
        container.style.cursor = 'default';
    });
}

function getNodeColor(type) {
    const colors = {
        'question': '#667eea',
        'topic': '#764ba2',
        'subject': '#f093fb',
        'skill': '#4facfe'
    };
    return colors[type] || '#667eea';
}

function getNodeShape(type) {
    const shapes = {
        'question': 'box',
        'topic': 'dot',
        'subject': 'diamond',
        'skill': 'star'
    };
    return shapes[type] || 'dot';
}

// ===================================
// SHOW NODE DETAILS
// ===================================

async function showNodeDetails(nodeId) {
    try {
        const data = await fetchAPI(`/graph/node/${nodeId}`);
        if (data && data.success) {
            const node = data.data;
            const nodeDetailsContent = document.getElementById('nodeDetailsContent');

            nodeDetailsContent.innerHTML = `
                <h6 class="mb-3">${node.label}</h6>
                <p><strong>Type:</strong> ${node.type}</p>
                <p><strong>Related Items:</strong> ${node.relatedCount || 0}</p>
                <p><strong>Strength:</strong> ${node.strength || 0}%</p>
                ${node.description ? `<p><strong>Description:</strong> ${node.description}</p>` : ''}
            `;

            const modal = new bootstrap.Modal(document.getElementById('nodeDetailsModal'));
            modal.show();
        }
    } catch (error) {
        showToast('Failed to load node details', 'danger', 'Error');
    }
}

// ===================================
// UPDATE GRAPH STATS
// ===================================

function updateGraphStats(data) {
    document.getElementById('totalNodes').textContent = data.totalNodes || 0;
    document.getElementById('totalConnections').textContent = data.totalEdges || 0;
    document.getElementById('graphDensity').textContent = 
        (data.density || 0).toFixed(1) + '%';
}
