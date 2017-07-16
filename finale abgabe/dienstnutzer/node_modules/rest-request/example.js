var RequestAPI = require('./rest-request.js');
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