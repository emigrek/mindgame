FROM node:22-slim

ENV TZ=Europe/Warsaw

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

USER node

# Node directly instead of `npm run prod` (`tsx src`): npm and the tsx CLI each keep a parent process (~115 MB together),
# and node as PID 1 receives docker stop's SIGTERM itself. Never tsx watch: it keeps running after a crash,
# so the restart policy would never kick in.
CMD ["node", "--import", "tsx", "src/index.ts"]
