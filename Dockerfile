FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy website files
COPY . .

# Expose the port
EXPOSE 8080

# Start server
CMD ["serve", "-s", ".", "-l", "8080"]