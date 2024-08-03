FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN ng build

ENV PORT=3000

EXPOSE $PORT

CMD ["sh", "-c", "node server.js"]
