# Use uma imagem Node.js com Puppeteer pré-instalado
FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Definir o diretório de trabalho
WORKDIR /app

# Mudar para root temporariamente para instalar dependências
USER root

# Copiar package.json primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Ajustar permissões e instalar dependências
RUN chown -R pptruser:pptruser /app && \
    npm install --only=production && \
    npm cache clean --force

# Copiar o resto dos arquivos
COPY . .

# Ajustar permissões novamente
RUN chown -R pptruser:pptruser /app

# Expor a porta
EXPOSE 3000

# Voltar para usuário não-root para segurança
USER pptruser

# Comando para iniciar a aplicação
CMD ["npm", "start"]
