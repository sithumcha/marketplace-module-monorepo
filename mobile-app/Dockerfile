FROM node:18-alpine

WORKDIR /app

COPY build/web ./build/web
COPY package*.json ./ 2>/dev/null || true

EXPOSE 3000

CMD ["npx", "-y", "serve", "-s", "build/web", "-l", "3000"]
