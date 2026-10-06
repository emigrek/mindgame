FROM node:22

ENV TZ=Europe/Warsaw

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

USER node

# Not `npm start`: tsx watch keeps running after the bot crashes, so a restart policy would never kick in
CMD ["npm", "run", "prod"]
