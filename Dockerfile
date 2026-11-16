# Frontend build
FROM node:24-alpine AS frontend-build

WORKDIR /app/src

COPY src/package.json src/package-lock.json ./
RUN npm ci

COPY src/ ./

RUN npm run build


# Backend dependencies
FROM node:24-alpine AS backend-build

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/ ./


# Production application
FROM node:24-alpine

WORKDIR /app

ARG PORT

ENV NODE_ENV=production
ENV PORT=$PORT

COPY --from=backend-build /app/server ./server
COPY --from=frontend-build /app/src/dist ./dist

WORKDIR /app/server

EXPOSE $PORT

CMD ["sh", "-c", "node index.js"]
