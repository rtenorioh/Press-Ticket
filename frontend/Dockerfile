FROM node:22-bookworm-slim AS builder

ARG VITE_BACKEND_URL=http://localhost:8000
ARG VITE_HOURS_CLOSE_TICKETS_AUTO=
ARG VITE_MASTERADMIN=ON

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_HOURS_CLOSE_TICKETS_AUTO=$VITE_HOURS_CLOSE_TICKETS_AUTO
ENV VITE_MASTERADMIN=$VITE_MASTERADMIN

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim

WORKDIR /app

COPY --from=builder /app/build ./build
COPY server.js ./
COPY package*.json ./

RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "server.js"]
