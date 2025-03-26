# Dockerfile for the server
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure the data directory is copied to the dist folder
COPY src/data/mcp-servers.json dist/data/mcp-servers.json

# Build the application
RUN npm run build

# Expose port 3001
EXPOSE 3001

# Start the server
CMD ["npm", "start"]