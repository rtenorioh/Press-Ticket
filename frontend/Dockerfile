FROM node:22-bookworm-slim AS builder

ARG REACT_APP_BACKEND_URL=http://localhost:8000
ARG REACT_APP_HOURS_CLOSE_TICKETS_AUTO=
ARG REACT_APP_MASTERADMIN=ON

ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_HOURS_CLOSE_TICKETS_AUTO=$REACT_APP_HOURS_CLOSE_TICKETS_AUTO
ENV REACT_APP_MASTERADMIN=$REACT_APP_MASTERADMIN

WORKDIR /app

COPY package*.json ./
RUN npm install

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
