# Use official Node.js 18 slim image
FROM node:18-slim

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Cloud Run sets $PORT dynamically
EXPOSE 8080

# Correct CMD syntax (use double quotes for JSON array form)
CMD ["npm", "start"]
