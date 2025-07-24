document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard');
    const ws = new WebSocket(`ws://${window.location.host}`);

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
            connectorElement.setAttribute("data-status", status); // 👈 ESSA LINHA FALTAVA
            connectorElement.innerHTML = `
                <img src="${connector.imageUrl}" alt="${connector.name}" class="connector-logo">
                <div class="connector-name">${connector.name}</div>
                <div class="connector-status status-${status}">${status}</div>
            `;
            dashboard.appendChild(connectorElement);

        });
    }
});


const conectores = [
  {
    nome: "Banco Bmg Empresas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Banco_BMG_logo.svg/512px-Banco_BMG_logo.svg.png",
    status: "ONLINE"
  },
  {
    nome: "Banco do Brasil Empresas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Banco_do_Brasil_logo.svg/512px-Banco_do_Brasil_logo.svg.png",
    status: "ONLINE"
  },
  {
    nome: "Bradesco Empresas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bradesco_logo.svg/512px-Bradesco_logo.svg.png",
    status: "OFFLINE"
  },
  {
    nome: "Caixa Econômica Federal Empresas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Caixa_Econ%C3%B4mica_Federal_logo.svg/512px-Caixa_Econ%C3%B4mica_Federal_logo.svg.png",
    status: "UNSTABLE"
  }
];

function carregarConectores() {
  const dashboard = document.getElementById("dashboard");
  dashboard.innerHTML = "";

  conectores.forEach(con => {
    const div = document.createElement("div");
    div.className = "connector";
    div.setAttribute("data-status", con.status);

    div.innerHTML = `
      <img src="${con.logo}" class="connector-logo" alt="${con.nome}" />
      <div class="connector-name">${con.nome}</div>
      <div class="connector-status status-${con.status}">${con.status}</div>
    `;

    dashboard.appendChild(div);
  });
}

function filtrarStatus() {
  const filtro = document.getElementById("statusFilter").value;
  const conectores = document.querySelectorAll(".connector");

  conectores.forEach(connector => {
    const status = connector.getAttribute("data-status");
    if (filtro === "TODOS" || status === filtro) {
      connector.style.display = "flex";
    } else {
      connector.style.display = "none";
    }
  });
}
