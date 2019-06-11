FROM openfaas/of-watchdog:0.5.3 as watchdog

FROM buildkite/puppeteer:v1.15.0

# Turn down the verbosity to default level.
ENV NPM_CONFIG_LOGLEVEL warn

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog

COPY --chown=node:node package.json package-lock*.json ./
RUN npm install --production

WORKDIR /home/node/function
COPY --chown=node:node function/package.json function/package-lock*.json ./
RUN npm install --production

WORKDIR /home/node
COPY --chown=node:node . .

ENV cgi_headers="true"
ENV fprocess="node index.js"
ENV mode="http"
ENV upstream_url="http://127.0.0.1:3000"

ENV exec_timeout="10s"
ENV write_timeout="15s"
ENV read_timeout="15s"

HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]