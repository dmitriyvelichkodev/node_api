FROM node:8-alpine

ENV NODE_ENV=development
ENV HOME=/app

# prepare for install dependecies
COPY ./package.json $HOME/
RUN chown -R node:node $HOME
USER node

# install dependecies
WORKDIR $HOME
RUN npm install

ADD .

### Add the wait script to the image
#ADD https://raw.githubusercontent.com/ufoscout/docker-compose-wait/1.0.0/wait.sh /wait.sh
#RUN chmod +x /wait.sh

EXPOSE 3000

## Start the wait.sh script and then your application
#CMD ["/bin/sh", "wait.sh"]
