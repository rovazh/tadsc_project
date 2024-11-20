FROM node:21

RUN mkdir /var/www
COPY . /var/www
WORKDIR /var/www
RUN npm i
EXPOSE 3000

CMD node app.js
