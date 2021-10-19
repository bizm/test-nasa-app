FROM node:latest

WORKDIR ~

COPY server/package.json ./server/
COPY server/src/* ./server/src/
COPY client/*.json client/*.lock ./client/
COPY client/src/* ./client/src/
COPY client/public/* ./client/public/

RUN cd client && echo "SKIP_PREFLIGHT_CHECK=true" > .env && \
    npm i && npm run build
RUN cd server && npm i
EXPOSE 80

CMD node server/src/server.js
