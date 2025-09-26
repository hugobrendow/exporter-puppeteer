# Use a imagem oficial do Puppeteer que já tem tudo configurado
FROM ghcr.io/puppeteer/puppeteer:22.6.5

# Voltar para root para instalar dependências
USER root

# Definir o diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY . .

# Ajustar permissões para o usuário pptruser
RUN chown -R pptruser:pptruser /app

# Expor a porta
EXPOSE 3000

# Voltar para usuário não-root
USER pptruser

# Comando para iniciar a aplicação
CMD ["npm", "start"]
