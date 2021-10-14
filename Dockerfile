FROM node:latest

WORKDIR ~

COPY package.json ./
COPY src/* ./src/
COPY client/*.json client/*.lock ./client/
COPY client/src/* ./client/src/
COPY client/public/* ./client/public/

RUN npm i
RUN cd client && npm i && npm run build
EXPOSE 80

RUN apt-get update && apt-get install parallel -y

CMD node src/server.js
