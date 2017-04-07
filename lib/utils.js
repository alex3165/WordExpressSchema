'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral(['\n      query getPage($pageName: String!){\n        page(name: $pageName){\n          post_name,\n          layout{\n            id,\n            meta_value\n          }\n        }\n      }\n    '], ['\n      query getPage($pageName: String!){\n        page(name: $pageName){\n          post_name,\n          layout{\n            id,\n            meta_value\n          }\n        }\n      }\n    ']);

exports.setLayout = setLayout;

var _graphqlTag = require('graphql-tag');

var _graphqlTag2 = _interopRequireDefault(_graphqlTag);

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function setLayout(nextState, replaceState, cb) {
  var _this = this;

  var page = nextState.params.page;
  var Layouts = nextState.routes[0].Layouts;


  return _client2.default.query({
    query: (0, _graphqlTag2.default)(_templateObject),
    variables: {
      pageName: page || 'homepage'
    }
  }).then(function (graphQLResult) {
    var errors = graphQLResult.errors,
        data = graphQLResult.data;

    var Layout = void 0;

    if (data.page) {
      if (data.page.layout) {
        Layout = Layouts[data.page.layout.meta_value] || Layouts['Default'];
      } else {
        Layout = Layouts['Default'];
      }
    } else {
      Layout = Layouts['NotFound'];
    }

    _this.layout = Layout;
    _this.component = Layout.Component;
    cb();

    if (errors) {
      console.log('got some GraphQL execution errors', errors);
    }
  }).catch(function (error) {
    console.log('there was an error sending the query', error);
  });
}