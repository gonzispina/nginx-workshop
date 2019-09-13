FROM python:3.7.4

LABEL maintainer="gspina1995@gmail.com"

ENV TZ=America/Argentina/Buenos_Aires

WORKDIR /usr/local/app

COPY requirements.txt ./
RUN pip3 install --requirement requirements.txt

COPY . .

CMD [ "python", "server.py" ]
