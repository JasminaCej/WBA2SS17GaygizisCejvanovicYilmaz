var fs = require('fs');
var chalk = require('chalk');

fs.readFile('staedte.json', function(err,data){
  if(err){
    console.log("Datei nicht gefunden");
  }else{
    var dateiString = JSON.parse(data.toString());
    fs.writeFile('staedte.json', JSON.stringify(dateiString), function(err){
      dateiString.cities.forEach(function(cities){
        console.log(chalk.red('Name: ' + cities.name));
        console.log(chalk.green('Country: ' + cities.country));
        console.log(chalk.blue('Population: ' + cities.population));
        console.log('-------------------------------------');

      });
  });
}
});
