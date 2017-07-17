var lat, lon;
var temp, pressure, humidity;
var weatherDescription, weatherIcon;
var windSpeed, windDirection;
var clouds;
var address;
var isTempCelsius = true;
var map;

$(document).ready(function($) {
	$(window).resize(function() {
		var h = $(window).height(),
			offsetTop = $('#title').outerHeight(true),
			offsetBottom = $('footer').outerHeight(true),
			containerMargin = $('.container-fluid').outerHeight(true) - $('.container-fluid').height();
		var mapHeight = h - (offsetTop + offsetBottom + containerMargin);

		var w = $(window).width();
		if (w < 576 && mapHeight > 200) mapHeight = 200;
		else if (w < 758 && mapHeight > 350) mapHeight = 350;
		else if (w < 992 && mapHeight > 400) mapHeight = 400;
		$('#map').outerHeight(mapHeight);
		try{
			map.setCenter({lat: lat, lng: lon});	
		} catch(e) {
			console.log("It is possible that the map has not been created yet.");
		}
	}).resize();

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			lat = position.coords.latitude;
			lon = position.coords.longitude;

			$.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAgSOS7E46jO0a4goLUoVxz-WLp0bqNvjc&callback=initMap");

			var api_url = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
				lat.toString().replace(".", "%2E") + '&lon=' +
				lon.toString().replace(".", "%2E") + '&units=metric&appid=547e297e6f5a22e9e46beaf8702d49f8';

			console.log(api_url);
			$.ajax({
				dataType: "jsonp",
				url: api_url,
				success: function(data) {
					console.log("La tempertaura es de: " + data.main.temp);
					console.log(data);
					temp = data.main.temp;
					pressure = data.main.pressure;
					humidity = data.main.humidity;
					weatherDescription = data.weather[0].description;
					weatherIcon = data.weather[0].icon;
					windSpeed = data.wind.speed;
					windDirection = degreesToWindDirection(data.wind.deg);
					clouds = data.clouds.all;
					console.log(windDirection);
					setWeatherData();
				}
			});
			$.ajax({
				dataType: "json",
				url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
					lat.toString().replace(".", "%2E") + "," +
					lon.toString().replace(".", "%2E") + "&key=AIzaSyAgSOS7E46jO0a4goLUoVxz-WLp0bqNvjc",
				success: function(data) {
					console.log(data);
					if (data.results.length > 1)
						address = data.results[1]["formatted_address"];
					else
						address = data.results[0]["formatted_address"];
					setMapVisible();
				}
			});
		});
	}

	$('#temp-button').on("click", function() {
		if (isTempCelsius) {
			$('#temp-icon').attr('src', 'img/f.png');
			$('#temp-value').html(celsiusToFahrenheit($('#temp-value').html()) + "°");
		} else {
			$('#temp-icon').attr('src', 'img/c.png');
			$('#temp-value').html(fahrenheitToCelsius($('#temp-value').html()) + "°");
		}
		isTempCelsius = !isTempCelsius;
		
	});

	function setWeatherData() {
		$('#location').html('The weather in <span class="font-weight-bold">' + address + '</span>');
		$('#weather-icon').attr('src', 'img/' + weatherIcon + '.png');
		$('#weather-description').html(titleCase(weatherDescription));
		$('#temp-icon').attr('src', 'img/c.png');
		$('#temp-value').html(temp + "°");
		$('#wind-table').html(windSpeed + " m/s  " + windDirection);
		$('#pressure-table').html(pressure + " hpa");
		$('#humidity-table').html(humidity + " %");
		$('#cloudiness-table').html(clouds + " %");
		$('#geocords-table').html("[" + Math.round(lat * 100) / 100 + ", " + Math.round(lon * 100) / 100 + "]");
		$('#weather-data').removeClass('invisible');
	}
	function setMapVisible() {
		$('#map').removeClass('invisible');
	}
});

function initMap() {
	var currentPosition = {
		lat: lat,
		lng: lon
	};
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: currentPosition
	});
	map.set('scrollwheel', false);
	var marker = new google.maps.Marker({
		position: currentPosition,
		map: map
	});
}

function titleCase(str) {
	str = str.toLowerCase();
	var strToArr = str.split(" ");
	strToArr = strToArr.map(function(val) {
		return val[0].toUpperCase() + val.substring(1);
	});
	return strToArr.join(" ");
}

function degreesToWindDirection(degrees) {
	if (degrees > 22.5) return "Northeast(" + degrees + "°)";
	else if (degrees > 67.5) return "East(" + degrees + "°)";
	else if (degrees > 112.5) return "Southeast(" + degrees + "°)";
	else if (degrees > 157.5) return "South(" + degrees + "°)";
	else if (degrees > 202.5) return "Southwest(" + degrees + "°)";
	else if (degrees > 247.5) return "West(" + degrees + "°)";
	else if (degrees > 292.5) return "Northwest(" + degrees + "°)";
	else return "North(" + degrees + "°)";
}

function celsiusToFahrenheit(celsius) {
	celsius = celsius.substring(0, celsius.length - 1);
	return Math.round(((parseFloat(celsius) * 1.8) + 32) * 10) / 10;
}

function fahrenheitToCelsius(fahrenheit) {
	fahrenheit = fahrenheit.substring(0, fahrenheit.length - 1);
	return Math.round(((parseFloat(fahrenheit) - 32) / 1.8) * 10) / 10;
}