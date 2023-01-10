FROM node:lts

WORKDIR /app

EXPOSE 8787 8787
COPY . /app/

RUN yarn install

CMD ["node", "index.js"]