# Gerador de Etiquetas PDF

API para gerar etiquetas de gondola em PDF usando Node.js, Express e Puppeteer.

## 🚀 Como executar com Docker

### Pré-requisitos
- Docker
- Docker Compose

### Executar o projeto
```bash
# Clone o repositório
git clone <seu-repositorio>
cd exporter

# Suba o container
docker-compose up -d

# Para ver os logs
docker-compose logs -f

# Para parar
docker-compose down
```

A aplicação estará disponível em: `http://localhost:3000`

## 📡 API

### POST `/api/gerar-pdf`

Gera um PDF com etiquetas dos produtos.

**Body (JSON):**
```json
{
  "produtos": [
    {
      "nome": "Nome do Produto",
      "preco": "29.90",
      "codigo": "12345",
      "quantidade": 2
    }
  ]
}
```

**Resposta:** Arquivo PDF para download

## 🛠️ Desenvolvimento

### Executar localmente (sem Docker)
```bash
# Instalar dependências
npm install

# Executar
npm start
```

### Estrutura do projeto
```
├── src/
│   ├── server.js          # Servidor Express
│   └── pdfGenerator.js    # Geração de PDF
├── public/
│   ├── logo.png          # Logo da empresa
│   └── fonts/            # Fontes customizadas
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🎨 Personalização

- **Logo**: Substitua o arquivo `public/logo.png`
- **Fontes**: Adicione fontes TTF na pasta `public/fonts/`
- **Layout**: Edite o CSS no arquivo `src/pdfGenerator.js`

## 📝 Exemplo de uso

```bash
curl -X POST http://localhost:3000/api/gerar-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "produtos": [
      {
        "nome": "Produto Exemplo",
        "preco": "15.99",
        "codigo": "ABC123",
        "quantidade": 1
      }
    ]
  }' \
  --output etiquetas.pdf
```
