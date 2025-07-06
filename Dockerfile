# Dockerfile for development environment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Python for the simple HTTP server
RUN apk add --no-cache python3 py3-pip

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Update browserslist database to avoid warnings
RUN npx update-browserslist-db@latest

# Copy source code
COPY . .

# Create the CSS output directory if it doesn't exist
RUN mkdir -p src/css

# Build TailwindCSS for the first time
RUN npm run build:css:dev

# Expose port
EXPOSE 8000

# Default command - will be overridden by docker-compose
CMD ["sh", "-c", "npm run build:css:watch & python3 -m http.server 8000 --directory src"]
