# Simple Angular Development Server
FROM node:18-alpine

WORKDIR /app

# Install Angular CLI globally first
RUN npm install -g @angular/cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 4200

# Start dev server
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
