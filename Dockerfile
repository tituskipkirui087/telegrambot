FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port (required for Fly.io)
EXPOSE 8080

# Start the bot
CMD ["node", "bot.js"]
