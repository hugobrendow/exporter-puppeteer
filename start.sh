#!/bin/bash

set -e  # Parar se algum comando falhar

echo "🐳 Iniciando o Gerador de Etiquetas PDF..."

# Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Detectar comando docker-compose
DOCKER_COMPOSE_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    else
        echo "❌ Docker Compose não encontrado."
        exit 1
    fi
fi

echo "🧹 Limpando containers antigos..."
$DOCKER_COMPOSE_CMD down --remove-orphans || true

echo "📦 Construindo a imagem..."
$DOCKER_COMPOSE_CMD build --no-cache

echo "🚀 Iniciando os serviços..."
$DOCKER_COMPOSE_CMD up -d

echo "⏳ Aguardando o serviço ficar pronto..."
for i in {1..30}; do
    if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Serviço está rodando!"
        echo "🌐 Acesse: http://localhost:3000"
        echo ""
        echo "🧪 Testando API..."
        echo "curl -X POST http://localhost:3000/api/gerar-pdf -H 'Content-Type: application/json' -d '{\"produtos\":[{\"nome\":\"Teste\",\"preco\":\"10.99\",\"codigo\":\"123\",\"quantidade\":1}]}' --output teste.pdf"
        echo ""
        echo "📋 Comandos úteis:"
        echo "  Ver logs: $DOCKER_COMPOSE_CMD logs -f"
        echo "  Parar: $DOCKER_COMPOSE_CMD down"
        echo "  Reiniciar: $DOCKER_COMPOSE_CMD restart"
        exit 0
    fi
    echo "⏳ Aguardando... ($i/30)"
    sleep 2
done

echo "⚠️  Timeout aguardando o serviço. Verifique os logs:"
echo "  $DOCKER_COMPOSE_CMD logs -f"
exit 1
