'use strict';

const net = require('net');
const command = require('./command');
const logger = console;

const config = {
  port: 3500,
  openPort: 3600,
};

const server = net.createServer();

let mainSocket;

async function getTunnelSocket() {
  // 向客户端发送命令：客户端发起一个新的连接
  mainSocket.write(command.NEW_CONNECT);
  return await new Promise(resolve => {
    server.once('connection', socket => {
      resolve(socket);
    })
  });
}

// 默认第一个连接为主连接
server.once('connection', socket => {
  socket.setNoDelay();
  mainSocket = socket;
});

server.listen(config.port, () => {
  logger.info(`server listen at port ${config.port}`);
});


const openServer = net.createServer();

openServer.on('connection', async openSocket => {
  if (!mainSocket) {
    logger.warn('openServer receive connection, but mainSocket not prepared');
    return openSocket.end();
  }

  const tunnel = await getTunnelSocket();
  logger.info('got new tunnel socket, begin tranform');

  tunnel.on('error', err => {
    logger.warn('tunnel error');
    logger.error(err);

    if (!tunnel.destroyed) tunnel.destroy();
    if (!openSocket.destroyed) openSocket.end();
  });

  openSocket.pipe(tunnel);
  tunnel.pipe(openSocket);
});

openServer.listen(config.openPort, () => {
  logger.info(`open server listen at port ${config.openPort}`);
});
