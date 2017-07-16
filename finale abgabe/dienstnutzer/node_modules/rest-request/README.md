# rest-request
A small node module for making REST requests.

## Installation
	npm install rest-request

## Usage
	var Request = require('rest-request');
	var restAPI = new Request('http://server.com');
	...
	var request = restAPI.get('customer/:id', {id:1001});

	request.then(function(customer) {
		...
	});

## Constructor

### new Request(path, options)

Constructs a new request object. It takes the following argument.

- **path** - Specifies the path to the REST api.
- **options** - Specifies an object with the following options.
	- **headers** - Specifies default headers that is added to each request.
	- **debug**   - Displays information to the console.

## Methods

### request.request

	request.request(method, path, params, headers)

- **method** - Specifies the method type, **get**, **put**, **post** or **delete**.
- **path** - Specifies the path.
- **params** - Optional object with parameters.
- **headers** - Optional headers to use.

The full uri string is built up using the static path specified in
the constructor combined with the path specified in this method.
The path may contain values from the parameters by
specifying them in the path.

	request.request('api/v2/customer/{id}', {id:1001})

or

	request.request('api/v2/customer/:id', {id:1001})

The parameters not used in the path are instead added
to the uri efter the '?' sign. For example the request

	request.request('api/v2/customer/:id', {id:1001, search:'foo', limit:3})

will generate the uri

	api/v2/customer/1001?search=foo&limit=3

### request.get(path, params, headers)

Equivalent with **request('GET', path, params, headers)**

### request.post(path, params, headers)

Equivalent with **request('POST', path, params, headers)**

### request.put(path, params, headers)

Equivalent with **request('PUT', path, params, headers)**

### request.delete(path, params, headers)

Equivalent with **request('DELETE', path, params, headers)**


## Example
	var RequestAPI = require('rest-request');
	var yahoo      = new RequestAPI('https://query.yahooapis.com');

	function getQuote(ticker) {
		var options = {};

		options.q        = 'select * from yahoo.finance.quotes where symbol =  "' + ticker + '"';
		options.format   = 'json';
		options.env      = 'store://datatables.org/alltableswithkeys';
		options.callback = '';

		yahoo.get('v1/public/yql', options).then(function(data) {
			var quotes = data.query.results.quote;

			if (typeof qoutes != 'Array')
				quotes = [quotes];

			console.log(ticker, '=', quotes[0].LastTradePriceOnly);		

		})

		.catch (function(error) {
			console.log(error);

		});

	}

	getQuote('AAPL');
