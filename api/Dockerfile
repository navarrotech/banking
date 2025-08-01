FROM node:latest

# Create app directory
WORKDIR /app

# Bundle app source
COPY src ./src
COPY package.json ./
COPY prisma ./prisma
COPY tsconfig.json ./
COPY localhost-key.pem ./
COPY localhost.pem ./

RUN yarn install
RUN yarn prisma generate

CMD [ "yarn", "run", "start" ]
