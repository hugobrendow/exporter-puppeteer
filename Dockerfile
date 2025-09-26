# Use uma imagem Node.js com Puppeteer pré-instalado
FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Definir o diretório de trabalho
WORKDIR /app

# Copiar package.json primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Expor a porta
EXPOSE 3000

# Definir usuário não-root para segurança
USER pptruser

# Comando para iniciar a aplicação
CMD ["npm", "start"]
