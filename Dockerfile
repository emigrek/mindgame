FROM node:22

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "start"]

EXPOSE 3000