var fs = require('fs');
var chalk = require('chalk');

fs.readFile('staedte.json', function(err,data){
	if(err){
		console.log("Datei nicht gefunden");
	}else{
		/* Aufgabe 1 */
		var dateiString = JSON.parse(data.toString());
		/*Aufgabe 3*/
		dateiString.cities.sort(function(a,b){
			return b.population - a.population;
		});
		/*Aufgabe 2*/
		fs.writeFile('staedte_sortiert.json', JSON.stringify(dateiString), function(err){
			dateiString.cities.forEach(function(cities){
				console.log(chalk.red('Name: '+ cities.name));
				console.log(chalk.green('Country: '+ cities.country));
				console.log(chalk.blue('Population: '+ cities.population));
				console.log('--------------------------------');
			});
		});
		
		
	}
});