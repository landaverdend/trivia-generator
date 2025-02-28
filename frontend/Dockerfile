FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/
COPY index.html ./
COPY vite.config.ts ./

# Build the app
RUN npm run build

# Serve the app
RUN npm install -g serve
EXPOSE 8081
CMD ["serve", "-s", "dist", "-l", "8081"] 