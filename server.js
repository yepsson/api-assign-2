var express = require('express');
var request = require('request-promise');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();

app.use("/stylesheet",express.static(__dirname + "/stylesheet"));
app.use("/script",express.static(__dirname + "/script"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended : true}));

mongoose.connect('mongodb://localhost:27017/express_weather')

    //Schemat för hur databasobjekten ska se ut
var citySchema = new mongoose.Schema({
    name : String, 
});


var cityModel = mongoose.model('City', citySchema);

    //funktion som tar staden ifrån input för att jämföra med api och hämta ut information och sparar sedan dessa som objekt i en array.
    //returnar detta tillbaks till funktionsanropet som sedan tar det till frontend
async function getWeather(cities) {
    var weather_data = [];
    
    for (var city_obj of cities) {
        var city = city_obj.name;
        var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=a0954b436b0e62fa3ebf9ab97614258e`;
        var response_body = await request(url);

        var weather_json = JSON.parse(response_body);
        
        var weather = {
            
            city : city,
            country : weather_json.country,
            temperature : Math.round(weather_json.main.temp),
            description : weather_json.weather[0].description,
            icon : weather_json.weather[0].icon,
            wind : weather_json.wind.speed
        };
        
        weather_data.push(weather);
    }
    return weather_data;
}

app.get('/', function(req, res) {

        //kollar igenom databasen efter befintliga städer i databasen och skickar till frontend

    cityModel.find({}, function(err, cities) {
       
        getWeather(cities).then(function(results) {

            var weather_data = {weather_data : results};
            
            res.render('weather', weather_data);
        });
    });      
});

    //hämtar hem namnet på staden ifrån inputfältet

app.post('/', cities);
   
    //kollar om stad redan är inlagd i databasen, om inte lägger den till!

   async function cities(req,res){

        var city = req.body.city_name;
        var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=a0954b436b0e62fa3ebf9ab97614258e`;
        var response_body = await(request(url)).catch(function(e){
            res.send("Hittar inte stad, försök igen!");
            console.log("Stad finns ej i openweather api")
        });
        if(response_body == undefined){

            return
        }

        var weather_json = JSON.parse(response_body);
        
        
        if(req.body.city_name == weather_json.name){
            
        cityModel.findOne({name: req.body.city_name}, function(err, cities) {
            
            if(cities){
                
                //Hit går den om staden redan är tillagd i databasen
                res.send("Staden finns redan tillagd i din lista");
                console.log("Stad finns redan i databasen")
            
            }
            else{

                //Här lägger den till staden i databasen om den inte finns sedan tidigare

                var newCity = new cityModel({name : req.body.city_name});
                newCity.save();
                res.redirect('/');
            }
        });     
    }
    else{

        console.log("staden finns ej!");
    }
    }

    //hämtar postanropet ifrån knapptrycket på vald stad och tar bort ifrån databasen

    app.post('/deleteCity', deleteCity);

    function deleteCity(req,res){

        var cityGone = req.body.cityDelete;
        
        cityModel.deleteOne({ name: cityGone }, function(err) {
            if (err) {
               res.send('error!');
            }
            else {
                res.redirect('/');
            }
        });
    }


    
app.listen(1337);