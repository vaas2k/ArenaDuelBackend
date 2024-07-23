FROM node:buster

RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev

WORKDIR /usr/src/app
COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
