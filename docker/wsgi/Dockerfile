# builder - temporary image to build pip wheels
FROM python:3.8-buster as builder
LABEL mantainer="jnnlbruno@gmail.com"
ENV VERSION 13

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1

ENV PYTHONUNBUFFERED 1


ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get -yqq update
RUN apt-get -yqq install python3-dev libpq-dev

RUN pip install --upgrade pip

# lint
RUN pip install flake8
COPY . /usr/src/app/
# TODO: uncomment after fixing 
#RUN flake8 --ignore=E501,F401

# install dependencies
COPY ./requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt

# final
FROM python:3.8-buster

# by default containers run as root, so we'll add an app user
RUN mkdir -p /home/app
RUN groupadd -r app && useradd -r -g app app

ENV HOME=/home/app
ENV APP_HOME=/home/app/web
ENV MEDIA_HOME=/home/app/web/media
RUN mkdir $APP_HOME
RUN mkdir $MEDIA_HOME
WORKDIR $APP_HOME

RUN apt-get -yqq update
RUN apt-get -yqq install python3-dev libpq-dev netcat
COPY --from=builder /usr/src/app/wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache /wheels/*

COPY ./entrypoint.sh $APP_HOME
COPY . $APP_HOME

RUN chown -R app:app $APP_HOME
RUN chown -R app:app $MEDIA_HOME

USER app

ENTRYPOINT ["/home/app/web/entrypoint.sh"]
