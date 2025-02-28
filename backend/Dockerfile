FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.node.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Expose port
EXPOSE 3001

# Run in development mode (since you're using ts-node-dev)
CMD ["npm", "run", "dev"] 