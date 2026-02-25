FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Copy built files and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY server ./server

ENV PORT=80
ENV STATIC_DIR=/app/dist

EXPOSE 80

CMD ["node", "server/index.mjs"]
