class UnsupportedWebSocket {
  constructor() {
    throw new Error('The ws package is not available in React Native.');
  }
}

module.exports = UnsupportedWebSocket;
module.exports.default = UnsupportedWebSocket;
