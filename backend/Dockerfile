FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

ENV PORT=5000
ENV MONGODB_URI=mongodb://mongodb:27017/marketplace_db

CMD ["node", "server.js"]
