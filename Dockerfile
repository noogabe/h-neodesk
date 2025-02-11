FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .
EXPOSE 8080

CMD ["node", "src/server.js"]
