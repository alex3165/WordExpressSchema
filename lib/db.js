'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _phpUnserialize = require('php-unserialize');

var _phpUnserialize2 = _interopRequireDefault(_phpUnserialize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WordExpressDatabase = function () {
  function WordExpressDatabase(settings) {
    _classCallCheck(this, WordExpressDatabase);

    this.settings = settings;
    this.connection = this.connect(settings);
    this.connectors = this.getConnectors();
    this.models = this.getModels();
  }

  _createClass(WordExpressDatabase, [{
    key: 'connect',
    value: function connect() {
      var _settings$privateSett = this.settings.privateSettings.database,
          name = _settings$privateSett.name,
          username = _settings$privateSett.username,
          password = _settings$privateSett.password,
          host = _settings$privateSett.host,
          port = _settings$privateSett.port;


      var Conn = new _sequelize2.default(name, username, password, {
        dialect: 'mysql',
        host: host,
        port: port || 3306,
        define: {
          timestamps: false,
          freezeTableName: true
        }
      });

      return Conn;
    }
  }, {
    key: 'getModels',
    value: function getModels() {
      var prefix = this.settings.privateSettings.wp_prefix;
      var Conn = this.connection;

      return {
        Post: Conn.define(prefix + 'posts', {
          id: { type: _sequelize2.default.INTEGER, primaryKey: true },
          post_author: { type: _sequelize2.default.INTEGER },
          post_title: { type: _sequelize2.default.STRING },
          post_content: { type: _sequelize2.default.STRING },
          post_excerpt: { type: _sequelize2.default.STRING },
          post_status: { type: _sequelize2.default.STRING },
          post_type: { type: _sequelize2.default.STRING },
          post_name: { type: _sequelize2.default.STRING },
          post_parent: { type: _sequelize2.default.INTEGER },
          menu_order: { type: _sequelize2.default.INTEGER },
          post_date: { type: _sequelize2.default.STRING }
        }),
        Postmeta: Conn.define(prefix + 'postmeta', {
          meta_id: { type: _sequelize2.default.INTEGER, primaryKey: true, field: 'meta_id' },
          post_id: { type: _sequelize2.default.INTEGER },
          meta_key: { type: _sequelize2.default.STRING },
          meta_value: { type: _sequelize2.default.INTEGER }
        }),
        User: Conn.define(prefix + 'users', {
          id: { type: _sequelize2.default.INTEGER, primaryKey: true },
          user_nicename: { type: _sequelize2.default.STRING },
          user_email: { type: _sequelize2.default.STRING },
          user_registered: { type: _sequelize2.default.STRING },
          display_name: { type: _sequelize2.default.STRING }
        }),
        Terms: Conn.define(prefix + 'terms', {
          term_id: { type: _sequelize2.default.INTEGER, primaryKey: true },
          name: { type: _sequelize2.default.STRING },
          slug: { type: _sequelize2.default.STRING },
          term_group: { type: _sequelize2.default.INTEGER }
        }),
        TermRelationships: Conn.define(prefix + 'term_relationships', {
          object_id: { type: _sequelize2.default.INTEGER, primaryKey: true },
          term_taxonomy_id: { type: _sequelize2.default.INTEGER },
          term_order: { type: _sequelize2.default.INTEGER }
        }),
        TermTaxonomy: Conn.define(prefix + 'term_taxonomy', {
          term_taxonomy_id: { type: _sequelize2.default.INTEGER, primaryKey: true },
          term_id: { type: _sequelize2.default.INTEGER },
          taxonomy: { type: _sequelize2.default.STRING },
          parent: { type: _sequelize2.default.INTEGER },
          count: { type: _sequelize2.default.INTEGER }
        })
      };
    }
  }, {
    key: 'getConnectors',
    value: function getConnectors() {
      var _settings$publicSetti = this.settings.publicSettings,
          amazonS3 = _settings$publicSetti.amazonS3,
          uploads = _settings$publicSetti.uploads;

      var _getModels = this.getModels(),
          Post = _getModels.Post,
          Postmeta = _getModels.Postmeta,
          User = _getModels.User,
          Terms = _getModels.Terms,
          TermRelationships = _getModels.TermRelationships;

      Terms.hasMany(TermRelationships, { foreignKey: 'term_taxonomy_id' });
      TermRelationships.belongsTo(Terms, { foreignKey: 'term_taxonomy_id' });

      TermRelationships.hasMany(Postmeta, { foreignKey: 'post_id' });
      Postmeta.belongsTo(TermRelationships, { foreignKey: 'post_id' });

      TermRelationships.belongsTo(Post, { foreignKey: 'object_id' });

      Post.hasMany(Postmeta, { foreignKey: 'post_id' });
      Postmeta.belongsTo(Post, { foreignKey: 'post_id' });

      return {
        getPosts: function getPosts(_ref) {
          var post_type = _ref.post_type,
              _ref$limit = _ref.limit,
              limit = _ref$limit === undefined ? 10 : _ref$limit,
              _ref$skip = _ref.skip,
              skip = _ref$skip === undefined ? 0 : _ref$skip;

          return Post.findAll({
            where: {
              post_type: post_type,
              post_status: 'publish'
            },
            limit: limit,
            offset: skip
          });
        },
        getPostsInCategory: function getPostsInCategory(termId, _ref2) {
          var post_type = _ref2.post_type,
              _ref2$limit = _ref2.limit,
              limit = _ref2$limit === undefined ? 10 : _ref2$limit,
              _ref2$skip = _ref2.skip,
              skip = _ref2$skip === undefined ? 0 : _ref2$skip;

          return TermRelationships.findAll({
            attributes: [],
            include: [{
              model: Post,
              where: {
                post_type: post_type,
                post_status: 'publish'
              }
            }],
            where: {
              term_taxonomy_id: termId
            },
            limit: limit,
            offset: skip
          }).then(function (posts) {
            return _lodash2.default.map(posts, function (post) {
              return post.wp_post;
            });
          });
        },
        getCategoryById: function getCategoryById(termId) {
          return Terms.findOne({
            where: { termId: termId }
          });
        },
        getPostById: function getPostById(postId) {
          return Post.findOne({
            where: {
              post_status: 'publish',
              id: postId
            }
          }).then(function (post) {
            if (post) {
              var id = post.dataValues.id;

              post.dataValues.children = [];
              return Post.findAll({
                attributes: ['id'],
                where: {
                  post_parent: id
                }
              }).then(function (childPosts) {
                if (childPosts.length > 0) {
                  _lodash2.default.map(childPosts, function (childPost) {
                    post.dataValues.children.push({ id: Number(childPost.dataValues.id) });
                  });
                }
                return post;
              });
            }
            return null;
          });
        },
        getPostByName: function getPostByName(name) {
          return Post.findOne({
            where: {
              post_status: 'publish',
              post_name: name
            }
          });
        },
        getPostThumbnail: function getPostThumbnail(postId) {
          return Postmeta.findOne({
            where: {
              post_id: postId,
              meta_key: '_thumbnail_id'
            }
          }).then(function (res) {
            if (res) {
              var metaKey = amazonS3 ? 'amazonS3_info' : '_wp_attached_file';

              return Post.findOne({
                where: {
                  id: Number(res.dataValues.meta_value)
                },
                include: {
                  model: Postmeta,
                  where: {
                    meta_key: metaKey
                  },
                  limit: 1
                }
              }).then(function (post) {
                if (post.wp_postmeta[0]) {
                  var thumbnail = post.wp_postmeta[0].dataValues.meta_value;
                  var thumbnailSrc = amazonS3 ? uploads + _phpUnserialize2.default.unserialize(thumbnail).key : uploads + thumbnail;

                  return thumbnailSrc;
                }
                return null;
              });
            }
            return null;
          });
        },
        getUser: function getUser(userId) {
          return User.findOne({
            where: {
              ID: userId
            }
          });
        },
        getPostLayout: function getPostLayout(postId) {
          return Postmeta.findOne({
            where: {
              post_id: postId,
              meta_key: 'page_layout_component'
            }
          });
        },
        getPostmetaById: function getPostmetaById(metaId, keys) {
          return Postmeta.findOne({
            where: {
              meta_id: metaId,
              meta_key: {
                $in: keys
              }
            }
          });
        },
        getPostmeta: function getPostmeta(postId, keys) {
          return Postmeta.findAll({
            where: {
              post_id: postId,
              meta_key: {
                $in: keys
              }
            }
          });
        },
        getMenu: function getMenu(name) {
          return Terms.findOne({
            where: {
              slug: name
            },
            include: [{
              model: TermRelationships,
              include: [{
                model: Post,
                include: [Postmeta]
              }]
            }]
          }).then(function (res) {
            if (res) {
              var menu = {
                id: null,
                name: name,
                items: null
              };
              menu.id = res.term_id;
              var relationship = res.wp_term_relationships;
              var posts = _lodash2.default.map(_lodash2.default.map(_lodash2.default.map(relationship, 'wp_post'), 'dataValues'), function (post) {
                var postmeta = _lodash2.default.map(post.wp_postmeta, 'dataValues');
                var parentMenuId = _lodash2.default.map(_lodash2.default.filter(postmeta, function (meta) {
                  return meta.meta_key === '_menu_item_menu_item_parent';
                }), 'meta_value');
                post.post_parent = parseInt(parentMenuId[0]);
                return post;
              });
              var navItems = [];

              var parentIds = _lodash2.default.map(_lodash2.default.filter(posts, function (post) {
                return post.post_parent === 0;
              }), 'id');

              _lodash2.default.map(_lodash2.default.sortBy(posts, 'post_parent'), function (post) {
                var navItem = {};
                var postmeta = _lodash2.default.map(post.wp_postmeta, 'dataValues');
                var isParent = _lodash2.default.includes(parentIds, post.id);
                var objectType = _lodash2.default.map(_lodash2.default.filter(postmeta, function (meta) {
                  return meta.meta_key === '_menu_item_object';
                }), 'meta_value');
                var linkedId = Number(_lodash2.default.map(_lodash2.default.filter(postmeta, function (meta) {
                  return meta.meta_key === '_menu_item_object_id';
                }), 'meta_value'));

                if (isParent) {
                  navItem.id = post.id;
                  navItem.post_title = post.post_title;
                  navItem.order = post.menu_order;
                  navItem.linkedId = linkedId;
                  navItem.object_type = objectType;
                  navItem.children = [];
                  navItems.push(navItem);
                } else {
                  var parentId = Number(_lodash2.default.map(_lodash2.default.filter(postmeta, function (meta) {
                    return meta.meta_key === '_menu_item_menu_item_parent';
                  }), 'meta_value'));
                  var existing = navItems.filter(function (item) {
                    return item.id === parentId;
                  });

                  if (existing.length) {
                    existing[0].children.push({ id: post.id, linkedId: linkedId });
                  }
                }

                menu.items = navItems;
              });
              return menu;
            }
            return null;
          });
        }
      };
    }
  }]);

  return WordExpressDatabase;
}();

exports.default = WordExpressDatabase;