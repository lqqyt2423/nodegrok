'use strict';

const http = require('http');
const logger = console;

const server = http.createServer((req, res) => {
  logger.info(req.url);
  logger.info(req.headers);

  res.end('ok\n');
});

server.listen(3700, () => {
  logger.info('demo server at 3700');
});
