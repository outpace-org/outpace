# Use a multi-stage build to install dependencies and build the app
FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g ionic
COPY . .
RUN node --max-old-space-size=8192 $(which npm) run build

# Use a new stage to create a lean production image
FROM node:18 as production
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["npm", "start"]
