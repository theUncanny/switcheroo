import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';

// http://stackoverflow.com/a/2117523
function generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

function currentPath(location) {
  var path = decodeURI(window.location[location].slice(1).split('?')[0]);
  if (path.charAt(0) !== '/') {
    return '/' + path;
  } else {
    return path;
  }
}

function removeTrailingSlash(path) {
  if (path === '/') {
    return path;
  } else {
    return path.slice(-1) !== '/' ? path : path.slice(0, -1);
  }
}

function replaceDynamicSegments(path) {
  return path.replace(/\/:[^\/]+/g, '/([^/]+)');
}

function getDynamicSegmentNames(path) {
  var dynamicSegementNames = path.match(/:[^\/]+/g) || [];
  return dynamicSegementNames.map(function (name) {
    return name.substr(1);
  });
}

function formatPathRegex(basePath, path) {
  return replaceDynamicSegments(removeTrailingSlash(basePath + path) + '/?');
}

function createRegexFromPaths(paths) {
  return new RegExp('^(' + paths.join('|') + ')$');
}

function getSwitch(path, _ref) {
  var children = _ref.children,
      basePath = _ref.basePath;

  var consistentPath = removeTrailingSlash(path);
  var switches = Children.toArray(children);
  return switches.filter(function (child) {
    var childPaths = [].concat(child.props.path).map(function (childPath) {
      return formatPathRegex(basePath, childPath);
    });
    var regex = createRegexFromPaths(childPaths);
    return regex.test(consistentPath);
  })[0] || null;
}

function getActivePath(currentPath, basePath, currentSwitch) {
  if (!currentSwitch) {
    return null;
  }

  var consistentPath = removeTrailingSlash(currentPath);
  var paths = [].concat(currentSwitch.props.path);
  return paths.filter(function (path) {
    var formattedPath = formatPathRegex(basePath, path);
    var regex = new RegExp('^' + formattedPath + '$');
    return regex.test(consistentPath);
  })[0] || null;
}

function getDynamicSegments(path, basePath, swtch) {
  var dynamicValues = {};
  var consistentPath = removeTrailingSlash(path);
  if (swtch) {
    [].concat(swtch.props.path).forEach(function (childPath) {
      var dynamicSegments = getDynamicSegmentNames(basePath + childPath);
      var regexStr = formatPathRegex(basePath, childPath);
      var matches = consistentPath.match(new RegExp('^' + regexStr + '$'));
      if (matches) {
        matches.shift();
        dynamicSegments.forEach(function (segment, index) {
          dynamicValues[segment] = matches[index];
        });
      }
    });
  }
  return dynamicValues;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Switcher = function (_Component) {
  inherits(Switcher, _Component);

  function Switcher(props) {
    classCallCheck(this, Switcher);

    var _this = possibleConstructorReturn(this, (Switcher.__proto__ || Object.getPrototypeOf(Switcher)).call(this, props));

    _initialiseProps.call(_this);

    var currPath = currentPath(props.location);
    var visibleSwitch = getSwitch(currPath, props);
    var activePath = getActivePath(currPath, props.basePath, visibleSwitch);
    var dynamicValues = getDynamicSegments(currPath, props.basePath, visibleSwitch);
    _this.state = {
      visibleSwitch: visibleSwitch,
      dynamicValues: dynamicValues,
      activePath: activePath
    };
    return _this;
  }

  createClass(Switcher, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var usingProvider = this.context.switcherProvider;
      if (usingProvider) {
        this._id = generateGuid();
      }

      if (this.props.load) {
        usingProvider ? this.context.switcherProvider.loadListeners.push({
          id: this._id,
          fn: this.handleRouteChange
        }) : window.addEventListener('load', this.handleRouteChange);
      }
      if (this.props.pushState) {
        usingProvider ? this.context.switcherProvider.popStateListeners.push({
          id: this._id,
          fn: this.handleRouteChange
        }) : window.addEventListener('popstate', this.handleRouteChange);
      }
      if (this.props.hashChange) {
        usingProvider ? this.context.switcherProvider.hashChangeListeners.push({
          id: this._id,
          fn: this.handleRouteChange
        }) : window.addEventListener('hashchange', this.handleRouteChange);
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.handleSwitchChange(nextProps);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !nextProps.preventUpdate();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.props.load) {
        window.removeEventListener('load', this.handleRouteChange);
      }
      if (this.props.pushState) {
        window.removeEventListener('popstate', this.handleRouteChange);
      }
      if (this.props.hashChange) {
        window.removeEventListener('hashchange', this.handleRouteChange);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _ref = this.state.visibleSwitch || {},
          props = _ref.props;

      var visibleSwitch = this.state.visibleSwitch && React.cloneElement(this.state.visibleSwitch, _extends({}, props, this.props.mapDynamicSegments(this.state.dynamicValues), {
        activePath: this.state.activePath
      }));

      if (this.props.renderSwitch) {
        return this.props.renderSwitch(visibleSwitch, this.state.dynamicValues, this.state.activePath);
      }

      if (this.props.wrapper) {
        var passedProps = _extends({}, this.props);
        Object.keys(Switcher.propTypes).forEach(function (k) {
          return delete passedProps[k];
        });
        return React.createElement(this.props.wrapper, passedProps, visibleSwitch);
      } else {
        return visibleSwitch;
      }
    }
  }]);
  return Switcher;
}(Component);

Switcher.displayName = 'Switcher';
Switcher.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  pushState: PropTypes.bool,
  hashChange: PropTypes.bool,
  load: PropTypes.bool,
  onChange: PropTypes.func,
  wrapper: PropTypes.any,
  location: PropTypes.string,
  basePath: PropTypes.string,
  preventUpdate: PropTypes.func,
  mapDynamicSegments: PropTypes.func,
  renderSwitch: PropTypes.func
};
Switcher.contextTypes = {
  switcherProvider: PropTypes.shape({
    loadListeners: PropTypes.array.isRequired,
    popStateListeners: PropTypes.array.isRequired,
    hashChangeListeners: PropTypes.array.isRequired
  })
};
Switcher.defaultProps = {
  pushState: false,
  hashChange: true,
  load: true,
  location: 'hash',
  basePath: '',
  preventUpdate: function preventUpdate() {
    return false;
  },
  mapDynamicSegments: function mapDynamicSegments(values) {
    return values;
  }
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.handleSwitchChange = function (props) {
    var currPath = currentPath(props.location);
    var visibleSwitch = getSwitch(currPath, props);
    var activePath = getActivePath(currPath, props.basePath, visibleSwitch);
    var dynamicValues = getDynamicSegments(currPath, props.basePath, visibleSwitch);

    if (typeof props.onChange === 'function') {
      props.onChange(!!visibleSwitch, currPath, dynamicValues, activePath);
    }

    _this2.setState({ visibleSwitch: visibleSwitch, dynamicValues: dynamicValues, activePath: activePath });
  };

  this.handleRouteChange = function (ev) {
    _this2.handleSwitchChange(_this2.props);
  };
};

var SwitcherProvider = function (_Component) {
  inherits(SwitcherProvider, _Component);

  function SwitcherProvider() {
    var _ref;

    var _temp, _this, _ret;

    classCallCheck(this, SwitcherProvider);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = SwitcherProvider.__proto__ || Object.getPrototypeOf(SwitcherProvider)).call.apply(_ref, [this].concat(args))), _this), _this.switcherProvider = {
      loadListeners: [],
      popStateListeners: [],
      hashChangeListeners: []
    }, _this.handleLoadListeners = function (e) {
      _this.switcherProvider.loadListeners.forEach(function (_ref2) {
        var fn = _ref2.fn;
        return fn(e);
      });
    }, _this.handlePopStateListeners = function (e) {
      _this.switcherProvider.popStateListeners.forEach(function (_ref3) {
        var fn = _ref3.fn;
        return fn(e);
      });
    }, _this.handleHashChangeListeners = function (e) {
      _this.switcherProvider.hashChangeListeners.forEach(function (_ref4) {
        var fn = _ref4.fn;
        return fn(e);
      });
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  createClass(SwitcherProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return { switcherProvider: this.switcherProvider };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      window.addEventListener('load', this.handleLoadListeners);
      window.addEventListener('popstate', this.handlePopStateListeners);
      window.addEventListener('hashchange', this.handleHashChangeListeners);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.removeEventListener('load', this.handleLoadListeners);
      window.removeEventListener('popstate', this.handlePopStateListeners);
      window.removeEventListener('hashchange', this.handleHashChangeListeners);
    }
  }, {
    key: 'render',
    value: function render() {
      if (Children.count(this.props.children) > 1) {
        return React.createElement(
          'span',
          { className: 'switcher-provider' },
          this.props.children
        );
      } else {
        return this.props.children;
      }
    }
  }]);
  return SwitcherProvider;
}(Component);

SwitcherProvider.displayName = 'SwitcherProvider';
SwitcherProvider.propTypes = {
  children: PropTypes.node
};
SwitcherProvider.childContextTypes = {
  switcherProvider: PropTypes.shape({
    loadListeners: PropTypes.array.isRequired,
    popStateListeners: PropTypes.array.isRequired,
    hashChangeListeners: PropTypes.array.isRequired
  })
};

export { SwitcherProvider };export default Switcher;
