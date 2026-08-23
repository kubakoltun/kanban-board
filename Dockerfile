# ==========================================
# Frontend build
# ==========================================
FROM node:24-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ==========================================
# Backend dependencies
# ==========================================
FROM node:24-alpine AS backend-build

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ .


# ==========================================
# Backend runtime
# ==========================================
FROM node:24-alpine AS backend

WORKDIR /app

COPY --from=backend-build /app/server ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "index.js"]


# ==========================================
# Frontend runtime
# ==========================================
FROM nginx:alpine AS frontend

COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
