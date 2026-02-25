FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application files
COPY . .

# Expose port (required for Fly.io)
EXPOSE 8080

# Start the bot
CMD ["node", "bot.js"]
