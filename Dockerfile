FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY *.mjs ./
COPY *.html ./
COPY *.css ./
COPY *.js ./

EXPOSE 4175

CMD ["npm", "start"]
