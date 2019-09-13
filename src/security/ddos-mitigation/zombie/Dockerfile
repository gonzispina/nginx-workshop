FROM node:10.15-alpine

LABEL maintainer="Gonzalo Spina <gspina1995@gmail.com>"

ENV TZ=America/Argentina/Buenos_Aires

RUN npm install -g autocannon

CMD ["autocannon", "-c 100", "-d 20", "http://nginx-ddos"]