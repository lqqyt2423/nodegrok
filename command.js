'use strict';

const command = {
  NEW_CONNECT: Buffer.from([1]),
};

const isEqual = (a, b) => {
  return Buffer.compare(a, b) === 0;
};

exports = module.exports = command;
exports.isEqual = isEqual;
