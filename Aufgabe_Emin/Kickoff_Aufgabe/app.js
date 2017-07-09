var fs = require('fs');

fs.readFile('staedte.json', function(err,data){
	if(err){
		console.log("Datei nicht gefunden");
	}else{
		/* Aufgabe 1 */
		var dateiString = JSON.parse(data.toString());
		fs.writeFile('staedte.json', JSON.stringify(dateiString), function(err){
			dateiString.cities.forEach(function(cities){
				console.log('Name: '+ cities.name);
				console.log('Country: '+ cities.country);
				console.log('Population: '+ cities.population);
				console.log('--------------------------------');
			});
		});
		
		
	}
});