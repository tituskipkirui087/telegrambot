# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy app files
COPY . .

# Expose port
EXPOSE 8080

# Start the bot
CMD ["node", "bot.js"]
