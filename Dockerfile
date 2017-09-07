# Image: sem3/api-webhooks

FROM node:6.9.5
MAINTAINER Arpit Agarwal <93arpit@gmail.com>

RUN mkdir -p /code
ADD . /code
WORKDIR /code

# CMD node dist/index.js
