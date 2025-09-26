#!/bin/bash

echo "🐳 Iniciando o Gerador de Etiquetas PDF..."

# Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verifica se o docker-compose está disponível
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instalando..."
    # Para sistemas com Docker Desktop, geralmente já vem incluído
    echo "Por favor, instale o Docker Compose ou use 'docker compose' (sem hífen) se estiver usando Docker Desktop."
    exit 1
fi

echo "📦 Construindo a imagem..."
docker-compose build

echo "🚀 Iniciando os serviços..."
docker-compose up -d

echo "⏳ Aguardando o serviço ficar pronto..."
sleep 10

# Testa se o serviço está funcionando
if curl -f http://localhost:3000/public/logo.png > /dev/null 2>&1; then
    echo "✅ Serviço está rodando!"
    echo "🌐 Acesse: http://localhost:3000"
    echo ""
    echo "📋 Comandos úteis:"
    echo "  Ver logs: docker-compose logs -f"
    echo "  Parar: docker-compose down"
    echo "  Reiniciar: docker-compose restart"
else
    echo "⚠️  Serviço pode estar iniciando ainda. Verifique com:"
    echo "  docker-compose logs -f"
fi
