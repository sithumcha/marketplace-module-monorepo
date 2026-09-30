# Multi-stage / All-in-One Dockerfile for Marketplace Module Monorepo
FROM node:18-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY admin-panel/package*.json ./admin-panel/
COPY client-web/package*.json ./client-web/

# Install dependencies
RUN cd backend && npm install --production
RUN cd admin-panel && npm install
RUN cd client-web && npm install

# Copy application source code
COPY backend ./backend
COPY admin-panel ./admin-panel
COPY client-web ./client-web
COPY mobile-app ./mobile-app
COPY start_all.js ./start_all.js

# Build production assets for frontend applications
RUN cd admin-panel && npm run build
RUN cd client-web && npm run build

# Expose ports for all services:
# 3000: Mobile Web App (Flutter)
# 3001: Admin Panel (React)
# 3002: Client Web App (React)
# 5000: Express Backend API & Socket.io
EXPOSE 3000 3001 3002 5000

ENV PORT=5000
ENV MONGODB_URI=mongodb://localhost:27017/marketplace_db
ENV JWT_SECRET=marketplace_secret_jwt_key_2026

# Start all services concurrently
CMD ["node", "start_all.js"]
