document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard');
    const ws = new WebSocket(`ws://${window.location.hostname}:3001`);

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = event => {
        const message = JSON.parse(event.data);
        console.log('Message received:', message);

        if (message.type === 'initial' || message.type === 'update') {
            updateDashboard(message.data);
        }
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };

    function updateDashboard(connectors) {
        dashboard.innerHTML = '';
        connectors.forEach(connector => {
            const status = connector.health?.status || 'OFFLINE';
            const connectorElement = document.createElement('div');
            connectorElement.className = 'connector';
            connectorElement.innerHTML = `
                <img src="${connector.imageUrl}" alt="${connector.name}" class="connector-logo">
                <div class="connector-name">${connector.name}</div>
                <div class="connector-status status-${status}">${status}</div>
            `;
            dashboard.appendChild(connectorElement);
        });
    }
});