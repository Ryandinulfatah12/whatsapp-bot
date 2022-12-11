FROM node:17-alpine

# Chrome
ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium \
    && npm install puppeteer

# npm packages
WORKDIR /
COPY package.json .
COPY package-lock.json .
RUN npm install


# App
WORKDIR /
COPY . /
ENTRYPOINT node index.js