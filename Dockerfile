FROM node:16-alpine
WORKDIR /usr/src/app

COPY .yarn .yarn/
COPY .yarnrc.yml yarn.lock package.json ./
COPY browser/package.json ./browser/
COPY core/package.json ./core/
COPY server/package.json ./server/


RUN yarn install --frozen-lockfile
COPY . .

EXPOSE ${PORT}
CMD [ "yarn", "workspace", "@kenrick95/c4-server", "start"]
