FROM node:20-slim AS builder

WORKDIR /app


COPY package*.json ./
COPY prisma ./prisma/

RUN apt-get update -y && apt-get install -y openssl ca-certificates

RUN npm ci


COPY . .

RUN npm run build
RUN npx prisma generate

FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD [ "npm", "run", "start:prod" ]
