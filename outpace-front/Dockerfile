# Build stage
FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build ./
COPY package*.json ./
RUN npm install --only=production

EXPOSE 3000
CMD ["npm", "run", "serve"]
