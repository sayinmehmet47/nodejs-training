
# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install any needed packages
RUN npm install

# Copy the rest of the application's code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Make port 5050 available to the world outside this container
EXPOSE 5050

# Run the app when the container launches
CMD ["node", "dist/server.js"]
