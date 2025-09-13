# --- 1) Build client ---
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN npm run build

# --- 2) Build server ---
FROM node:22-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server ./
RUN npm run build

# --- 3) Runtime (single container) ---
FROM node:22-alpine AS runner
WORKDIR /app

# copy built server + deps
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=server-build /app/server/node_modules ./server/node_modules

# copy built client to /app/client (index.ts looks at ../../client from dist)
COPY --from=client-build /app/client/dist ./client

# install wget for healthcheck
RUN apk add --no-cache wget

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/dist/index.js"]
