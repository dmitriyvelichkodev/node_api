FROM node:8-alpine

ENV NODE_ENV=development
ENV HOME=/app

# prepare for install dependecies
COPY ./package.json ./npm-shrinkwrap.json $HOME/
RUN chown -R node:node $HOME
USER node

# install dependecies
WORKDIR $HOME
RUN npm install

ADD . $HOME

EXPOSE 3000


