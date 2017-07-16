var clientRequest = require('client-request');

function isType(obj, type) {
	return Object.prototype.toString.call(obj) === '[object ' + type + ']';
};

function isArray(obj) {
	return isType(obj, 'Array');
};

function isString(obj) {
	return isType(obj, 'String');
};

function isObject(obj) {
	return obj !== null && isType(obj, 'Object');
};

module.exports = function(baseURL, opts) {

	var _debug = opts && opts.debug;

	this.get = function(path, params, headers) {
		return this.request('GET', path, params, headers);
	}

	this.put = function(path, params, headers) {
		return this.request('PUT', path, params, headers);
	}

	this.post = function(path, params, headers) {
		return this.request('POST', path, params, headers);
	}

	this.delete = function(path, params, headers) {
		return this.request('DELETE', path, params, headers);
	}

	this.request = function(method, path, params, headers) {

		function buildPath(path, params) {

			var parts = [];

			path.split('/').forEach(function(part) {
				var match = part.match('^:([_$@A-Za-z0-9]+)$');

				if (!match)
					match = part.match('^{([_$@A-Za-z0-9]+)}$');

				if (match) {
					var name = match[1];

					if (params[name] != undefined) {
						parts.push(params[name]);
						delete params[name]
					}
					else
						parts.push(part);
				}
				else
					parts.push(part);

			});

			return parts.join('/');
		};

		function buildParams(params) {

			if (params == undefined)
				params = {};

			function uriEncode(value) {

				if (isArray(value)) {
					value = value.join(',');
				}
				else if (isObject(value)) {
					value = JSON.stringify(value);
				}

				return encodeURIComponent(value);
			}

			var array = Object.keys(params).map(function(key) {
				return encodeURIComponent(key) + '=' + uriEncode(params[key]);
			});

			return array.join('&');
		}

		function buildHeaders(headers) {

			var result = {};

			// Add default headers
			if (opts && opts.headers) {
				Object.keys(opts.headers).forEach(function(key) {
					result[key.toLowerCase()] = opts.headers[key];
				});
			}

			if (isObject(headers)) {
				Object.keys(headers).forEach(function(key) {
					result[key.toLowerCase()] = headers[key];
				});
			}

			if (result['content-type'] == undefined)
				result['content-type'] = 'application/json';

			return result;
		};

		function buildBody(method, params, headers) {

			if (method == 'post' || method == 'put') {
				if (headers['content-type'] == 'application/json') {
					return JSON.stringify(params);
				}
				if (headers['content-type'] == 'application/x-www-form-urlencoded') {
					return buildParams(params);
				}
			}
		}

		function buildQuery(method, params) {
			if (method == 'get' || method == 'delete') {
				return buildParams(params);
			}

			return '';

		}

		function buildURI(method, path, params) {
			var path  = buildPath(path, params);
			var query = buildQuery(method, params);

			return baseURL + '/' + (query == '' ? path : path + '?' + query);
		}

		var options = {};
		options.method  = method.toLowerCase();
		options.uri     = buildURI(options.method, path, params);
		options.headers = buildHeaders(headers);
		options.body    = buildBody(options.method, params, options.headers);

		return new Promise(function(resolve, reject) {

			if (_debug) {
				console.log('method', options.method);
				console.log('uri', options.uri);
				console.log('headers', options.headers);
				console.log('body', options.body);
			}

			clientRequest(options, function (error, response, body) {

				if (!error && response.statusCode == 200) {

					var contentType = '';

					if (response.headers && isString(response.headers['content-type'])) {
						contentType = response.headers['content-type'];
					}

					if (contentType.match("application/json")) {

						try {
							// Pars JSON first
							var json = JSON.parse(body);

							// And resolve if succeeded
							resolve(json);
						}

						catch (error) {
							reject(error);
						}
					}
					else {
						resolve(body.toString());
					}
				}
				else {
					if (error == null)
						error = body.toString();

					try {
						error = JSON.parse(error);
					}
					catch (error) {
					}

					reject(error);

				}
			});

		});
	}


};
