FROM node:lts

WORKDIR /app

EXPOSE 3000 3000
COPY . /app/

RUN yarn install

CMD ["node", "index.js"]