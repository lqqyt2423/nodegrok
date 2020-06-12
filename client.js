'use strict';

const net = require('net');
const command = require('./command');
const logger = console;

const config = {
  serverPort: 3500,
  serverHost: 'localhost',
  localServerPort: 3700,
  localServerHost: 'localhost',
};

// 主连接
const client = net.createConnection(config.serverPort, config.serverHost);
client.setNoDelay();

client.on('data', chunk => {
  if (command.isEqual(chunk, command.NEW_CONNECT)) {
    // todo: 按照顺序来
    const localSocket = net.createConnection(config.localServerPort, config.localServerHost);
    const tunnel = net.createConnection(config.serverPort, config.serverHost);

    let localConnected = false, tunnelConnected = false;
    const triggleFn = () => {
      if (!localConnected || !tunnelConnected) return;
      tunnel.pipe(localSocket);
      localSocket.pipe(tunnel);
    };
    localSocket.on('connect', () => { localConnected = true; triggleFn(); });
    tunnel.on('connect', () => { tunnelConnected = true; triggleFn(); });

    localSocket.on('error', (err) => {
      logger.warn('localSocket error');
      logger.error(err);

      if (!localSocket.destroyed) localSocket.destroy();
      if (tunnelConnected && !tunnel.destroyed) {
        logger.info('tunnel end');
        tunnel.end();
      }
    });

    tunnel.on('error', (err) => {
      logger.warn('tunnel error');
      logger.error(err);

      if (!tunnel.destroyed) tunnel.destroy();
      if (localConnected && !localSocket.destroyed) localSocket.end();
    });
  }
});

client.on('connect', () => {
  logger.info(`client connected to server ${config.serverHost}:${config.serverPort}`);
});
