const express = require("express");

const app = express();

const request = require("request");

const http = require("https");

const var_dump = require('var_dump');

const mongoose = require("mongoose");

const bodyPsrser = require("body-parser");
const { response } = require("express");

app.use(bodyPsrser.json());


mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

let cityexist = true;

const kal = 273.15



const listSchema = {
  name: String,
};

const List = mongoose.model("List", listSchema);

app.post("/CitiesListDB", function (req, res) {
  
  const citytempIns = req.body.cityValue;

  List.findOne({ name: citytempIns }, function (err, foundList) {
   
    if (!err && cityexist) {
      if (!foundList) {
        const list = new List({
          name: citytempIns
        });

        list.save();
        List.find({}, function (err, cities) {
          var citiesMap = [];
          var i = 0;
          cities.forEach(function (city) {
            citiesMap.push(city.name);
          });
          res.send({ listTitle: citiesMap });
        });
      } else {
        List.find({}, function (err, cities) {
          var citiesMap = [];
          cities.forEach(function (city) {
            citiesMap.push(city.name);
          });
          console.log(citiesMap);
          res.send({ listTitle: citiesMap });
        });
      }
    }
  })
})





app.post("/WetherInCurrentCity", function (req, res) {
  const city = req.body.cityValue;
  const apikey = "25e768ac548f7f81282f9e26be81c5ea"
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apikey;
  http.get(url, function (response) {
    console.log(response.statusCode);
    response.on("data", function (data) {
      const weaterdata = JSON.parse(data.toString());
      try {
        var temp = weaterdata["main"]["temp"];
        cityexist = true;
      }
      catch (error) {
        cityexist = false;
        console.error(error);
        temp = "the city " + city + " not found";
      }
      if (!cityexist) {
        var obj = { data: temp }
      }
      else {
        obj = { data: "the weater in " + city + " is " + Math.round(temp - kal) + " °C" }
      }
      res.send(obj.data);
    })
  });
})


app.post("/TempFromApi", function (req, res) {
  var cities = [];
  var obj = [];
  var i = 0;
  cities = req.body.cities_temp;
  console.log(cities + " test_Raz");
  cities.forEach(function (city) {
    const apikey = "25e768ac548f7f81282f9e26be81c5ea"
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apikey;
    http.get(url, function (response) {
      console.log(response.statusCode);
      response.on("data", function (data) {
        console.log(data);
        const weaterdata = JSON.parse(data.toString());
        if (weaterdata["main"]) {
          var temp = weaterdata["main"]["temp"];
          obj.push(city + " " + Math.round(temp - kal));

        }
        i++;
        if (i === cities.length) {
          console.log(obj);
          res.send(obj);
        }
      })
    });
  });
})

app.delete("/deletefromDB", function (req, res) {
  const cityName = req.body.source;
  List.deleteOne({ name: cityName }, (err, result) => {
    List.find({}, function (err, cities) {
      var citiesMap = [];
      cities.forEach(function (city) {
        citiesMap.push(city.name);
      });
      res.send({ listTitle: citiesMap });
    });
  })
})



app.listen(5000, function () {
  console.log("server is running on port 5000");
});
