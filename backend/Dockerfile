FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --legacy-peer-deps

COPY . .

RUN npm install -g npm@11.3.0
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./


ENV NODE_ENV=production
ENV PORT=5000

EXPOSE ${PORT}

CMD ["node", "dist/main.js"]