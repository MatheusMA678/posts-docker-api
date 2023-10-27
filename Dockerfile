FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . .
EXPOSE 3333

RUN npx prisma generate

CMD [ "npm", "run", "start" ]