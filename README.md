# Visualizador de Status da Pluggy

Este projeto é um serviço de backend que monitora o status de uma lista pré-definida de conectores da Pluggy. Ele busca os status dos conectores a cada 5 minutos e fornece os dados através de uma API REST e uma conexão WebSocket para atualizações em tempo real.

## Funcionalidades

-   Busca os status dos conectores da API da Pluggy a cada 5 minutos.
-   Filtra os conectores com base em uma lista pré-definida.
-   Fornece uma API REST para obter o status atual dos conectores.
-   Usa WebSockets para enviar atualizações em tempo real para os clientes conectados.

## Começando

### Pré-requisitos

-   Node.js e npm instalados em sua máquina.
-   Postman (opcional, para testes).

### Instalação

1.  Clone o repositório:
    ```bash
    git clone <url-do-repositorio>
    ```
2.  Navegue até o diretório do projeto:
    ```bash
    cd visualizador-status-pluggy
    ```
3.  Instale as dependências:
    ```bash
    npm install
    ```

### Configuração

1.  Crie um arquivo `.env` na raiz do projeto.
2.  Adicione as seguintes variáveis de ambiente ao arquivo `.env`:

    ```
    host=https://api.pluggy.ai
    CLIENT_ID=seu_client_id
    CLIENT_SECRET=seu_client_secret
    ```

    Substitua `seu_client_id` e `seu_client_secret` com suas credenciais reais da API da Pluggy.

### Executando a Aplicação

Para iniciar o servidor, execute o seguinte comando:

```bash
npm start
```

O servidor será iniciado na porta 3000 (ou na porta especificada na variável de ambiente `PORT`).

## Endpoints da API

### API REST

-   **GET `/connectors`**

    Retorna um array JSON dos conectores atualmente monitorados.

-   **GET `/status`**

    Retorna um objeto JSON com a hora da última atualização e o número de conectores monitorados.

### API WebSocket
   
O servidor fornece atualizações em tempo real através de uma conexão WebSocket.

-   **URL de Conexão**: `ws://localhost:3000`

-   **Mensagens**:
    -   Quando um cliente se conecta, ele receberá uma mensagem `initial` com a lista atual de conectores.
    -   Sempre que a lista de conectores for atualizada, o servidor transmitirá uma mensagem `update` para todos os clientes conectados com a nova lista de conectores.

    **Exemplo de Formato de Mensagem:**

    ```json
    {
      "type": "initial" | "update",
      "data": [
        {
          "id": 221,
          "name": "Santander Empresas",
          ...
        }
      ]
    }
    ```

## Como Testar

### Testando com `curl`

Você pode usar o `curl` para testar os endpoints da API REST no terminal.

-   **Para obter os conectores:**
    ```bash
    curl http://localhost:3000/connectors
    ```
-   **Para obter o status:**
    ```bash
    curl http://localhost:3000/status
    ```

### Testando com um Navegador

Você pode usar o arquivo `test.html` incluído no projeto para testar a conexão WebSocket. Basta abrir o arquivo em seu navegador.

### Testando com o Postman

#### API REST

1.  Abra o Postman e crie uma nova requisição.
2.  Selecione o método `GET`.
3.  Insira a URL do endpoint que deseja testar:
    -   `http://localhost:3000/connectors`
    -   `http://localhost:3000/status`
4.  Clique em "Send" para enviar a requisição. A resposta aparecerá no painel inferior.

#### API WebSocket

1.  Abra o Postman e crie uma nova requisição WebSocket.
2.  Insira a URL de conexão: `ws://localhost:3000`.
3.  Clique em "Connect".
4.  Uma vez conectado, você verá as mensagens do servidor na seção "Messages". Você receberá a mensagem `initial` imediatamente e as mensagens `update` a cada 5 minutos.

## Customizando a Lista de Conectores

A lista de conectores a serem monitorados é definida no arquivo `conectorsMister.js`. Você pode modificar este arquivo para adicionar ou remover conectores conforme necessário. O arquivo exporta um objeto onde as chaves são os IDs dos conectores e os valores são os nomes dos conectores.