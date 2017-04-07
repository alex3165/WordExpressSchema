'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WordExpressClient = undefined;

var _apolloClient = require('apollo-client');

var _apolloClient2 = _interopRequireDefault(_apolloClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var networkInterface = (0, _apolloClient.createNetworkInterface)({ uri: '/graphql' });

var WordExpressClient = exports.WordExpressClient = new _apolloClient2.default({
  networkInterface: networkInterface
});