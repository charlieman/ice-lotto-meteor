FROM node:0.10

ENV DEBIAN_FRONTEND noninteractive
ENV PORT 80
ENV ROOT_URL http://127.0.0.1
ENV NODE_ENV production

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && curl https://install.meteor.com/ | /bin/sh

ADD ./.build/bundle /var/tbusca/
WORKDIR /var/tbusca/bundle/programs/server
RUN npm install

EXPOSE 80
WORKDIR /var/tbusca/bundle/

# RUN groupadd -r c3po && useradd -r -g c3po c3po

# USER c3po
CMD node ./main.js

