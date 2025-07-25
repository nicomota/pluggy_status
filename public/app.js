document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard');
    const ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
        console.log('Conectado ao servidor WebSocket');
    };

    ws.onmessage = event => {
        const message = JSON.parse(event.data);
        console.log('Mensagem recebida:', message);

        if (message.type === 'initial' || message.type === 'update') {
            updateDashboard(message.data);
        }
    };

    ws.onclose = () => {
        console.log('Desconectado do servidor WebSocket');
    };

    let allConnectors = [];
    let currentStatusFilter = 'TODOS';
    let currentTypeFilter = 'TODOS';

    function updateDashboard(connectors) {
        allConnectors = connectors;
        renderDashboard();
    }

    function renderDashboard() {
        dashboard.innerHTML = '';
        const filteredConnectors = allConnectors.filter(connector => {
            const status = connector.health?.status || 'OFFLINE';
            const type = connector.type;
            const name = connector.name.toLowerCase();
            const searchInput = document.getElementById('searchInput').value.toLowerCase();

            const statusMatch = currentStatusFilter === 'TODOS' || status === currentStatusFilter;
            const typeMatch = currentTypeFilter === 'TODOS' || type === currentTypeFilter;
            const searchMatch = name.includes(searchInput);

            return statusMatch && typeMatch && searchMatch;
        });

        filteredConnectors.forEach(connector => {
            const status = connector.health?.status || 'OFFLINE';
            const connectorElement = document.createElement('div');
            connectorElement.className = 'connector';
            connectorElement.setAttribute("data-status", status);
            connectorElement.setAttribute("data-type", connector.type);
            const typeText = connector.type === 'Direct' ? 'Direto' : 'OpenFinance';
            connectorElement.innerHTML = `
                <img src="${connector.imageUrl}" alt="${connector.name}" class="connector-logo">
                <div class="connector-name">${connector.name}</div>
                <div class="connector-type">Conector ${typeText}</div>
                <div class="connector-status status-${status}">${status}</div>
            `;
            dashboard.appendChild(connectorElement);
        });
    }

    window.filtrarStatus = function() {
        currentStatusFilter = document.getElementById('statusFilter').value;
        renderDashboard();
    }

    window.filtrarPorTipo = function(type) {
        currentTypeFilter = type;
        document.querySelectorAll('.button-filter').forEach(button => {
            button.classList.remove('active');
        });
        let buttonId;
        if (type === 'TODOS') {
            buttonId = 'btnTodos';
        } else {
            buttonId = `btn${type.charAt(0).toUpperCase() + type.slice(1)}`;
        }
        document.getElementById(buttonId).classList.add('active');
        renderDashboard();
    }

    window.buscarAgencia = function() {
        renderDashboard();
    }
});