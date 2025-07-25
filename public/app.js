document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard');
    const modal = document.getElementById('docModal');
    const modalBankName = document.getElementById('modalBankName');
    const modalBody = document.getElementById('modalBody');
    const closeButton = document.querySelector('.close-button');

    const ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
        console.log('Conectado ao servidor WebSocket');
    };

    ws.onmessage = event => {
        const message = JSON.parse(event.data);
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

            connectorElement.addEventListener('click', () => openModal(connector));
            dashboard.appendChild(connectorElement);
        });
    }

    function openModal(connector) {
        const bankData = documentationData[connector.name];
        modalBankName.textContent = connector.name;
        modalBody.innerHTML = ''; // Clear previous content

        if (!bankData) {
            modalBody.innerHTML = '<p>Não há dados de documentação detalhada para este conector.</p>';
            modal.style.display = 'block';
            return;
        }

        let tableAdded = false;
        // Mostra a tabela específica baseada no tipo do conector
        if (connector.type === 'Direct' && bankData.integration) {
            modalBody.appendChild(createIntegrationTable(bankData.integration));
            tableAdded = true;
        } else if (connector.type === 'OpenFinance' && bankData.openFinance) {
            modalBody.appendChild(createOpenFinanceTable(bankData.openFinance));
            tableAdded = true;
        }

        // Fallback se não encontrar tabela para o tipo específico
        if (!tableAdded) {
            modalBody.innerHTML = `<p>Não há dados de documentação para o tipo de conector '${connector.type}'.</p>`;
        }
        
        modal.style.display = 'block';
    }

    function createIcon(status) {
        if (status === true) return '<i class="bi bi-check-circle-fill icon icon-true"></i>';
        if (status === false) return '<i class="bi bi-x-circle-fill icon icon-false"></i>';
        if (status === 'partial') return '<i class="bi bi-exclamation-triangle-fill icon icon-partial"></i>';
        return status; // Return text if not a boolean
    }

    function createIntegrationTable(data) {
        const section = document.createElement('div');
        section.className = 'doc-section';
        let rows = '';
        for (const [key, value] of Object.entries(data)) {
            rows += `<tr><td>${key}</td><td>${createIcon(value)}</td></tr>`;
        }
        section.innerHTML = `
            <h3>Integração Direta</h3>
            <table class="doc-table">${rows}</table>
        `;
        return section;
    }

    function createOpenFinanceTable(data) {
        const section = document.createElement('div');
        section.className = 'doc-section';
        let rows = '';
        for (const [key, value] of Object.entries(data)) {
            rows += `<tr><td>${key}</td><td>${createIcon(value)}</td></tr>`;
        }
        section.innerHTML = `
            <h3>Open Finance</h3>
            <table class="doc-table">${rows}</table>
            <p style="font-size: 0.8rem; margin-top: 1rem;">
                <i class="bi bi-check-circle-fill icon-true"></i> Dados são disponibilizados<br>
                <i class="bi bi-exclamation-triangle-fill icon-partial"></i> Dados são disponibilizados, dependendo do pacote de serviços<br>
                <i class="bi bi-x-circle-fill icon-false"></i> Não há disponibilização dos documentos
            </p>
        `;
        return section;
    }

    // Close Modal Logic
    closeButton.onclick = () => modal.style.display = 'none';
    window.onclick = event => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Global functions for filters
    window.filtrarStatus = function() {
        currentStatusFilter = document.getElementById('statusFilter').value;
        renderDashboard();
    }

    window.filtrarPorTipo = function(type) {
        currentTypeFilter = type;
        document.querySelectorAll('.button-filter').forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(`btn${type}`).classList.add('active');
        renderDashboard();
    }

    window.buscarAgencia = function() {
        renderDashboard();
    }
});