FROM node:10
WORKDIR /lolstats/server
COPY package*.json /lolstats/server/
RUN npm install
COPY . /lolstats/server

EXPOSE 5000

CMD ["npm", "run", "dev"]