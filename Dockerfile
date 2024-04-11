FROM node:18.16.0

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "start"]

EXPOSE 3000