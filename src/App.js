import React, {Component} from 'react';
//import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Chart from 'chart.js';
import Autocomplete from 'react-google-autocomplete';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userLat: 22,
            userLon: 114,
            userLocationName: 'Hong Kong Area',
            weatherText: 'Smoggy',
            weatherTemp: [
                {
                    format: 'C',
                    value: 12
                }, {
                    format: 'F',
                    value: 54
                }
            ],
            tempFormat: "C",
            weatherIcon: "<^>",
            photoDescription: "",
            photoArr: [],
            searchLocationText: ""
        };
    }

    componentDidMount() {
        this.getUserLocationBrowser()

        var ctx = document.getElementById("myChart");

        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun"
                ],
                datasets: [
                    {
                        label: '# of Votes',
                        data: [
                            12,
                            11,
                            14,
                            9,
                            10,
                            8,
                            13
                        ],
                        backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                        borderColor: ['rgba(255,99,132,1)'],
                        borderWidth: 3
                    }
                ]
            },
            options: {
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [
                        {
                            display: false,
                            ticks: {
                                beginAtZero: false
                            }
                        }
                    ],
                    xAxes: [
                        {
                            display: false
                        }
                    ]
                }
            }
        });

        console.log(myChart);

    }

    getUserLocationBrowser() {

        var _self = this;
        if (navigator.geolocation) {
            console.log("Using Browser to get Location");
            navigator.geolocation.getCurrentPosition(success, error)

            function success(pos) {
                var crd = pos.coords;

                // console.log('Your current position is:');
                // console.log('Latitude : ' + crd.latitude);
                // console.log('Longitude: ' + crd.longitude);
                // console.log('More or less ' + crd.accuracy + ' meters.');

                //Set the state to reflect the user Location
                _self.setState({
                    userLat: crd.latitude,
                    userLon: crd.longitude
                }, _self.useUserLatLon(crd.latitude, crd.longitude))

            };

            function error(err) {
                console.warn('ERROR(' + err.code + '): ' + err.message);
                //Should Revert to other system if user denys Browser Location
                _self.getUserLocationIP()

            };
        } else {
            this.getUserLocationIP()

        }

    }

    getUserLocationIP() {
        console.log("Using IP to get the user location");
        axios.get(`https://ipinfo.io`).then(res => {
            var data = res.data
            //console.log(data);
            var LatLon = data.loc.split(",");
            //console.log(LatLon);
            var lat = LatLon[0]
            var lon = LatLon[1]
            //console.log(lat);
            //console.log(lon);

            this.setState({
                userLat: lat,
                userLon: lon
            }, this.useUserLatLon(lat, lon))

            //
            // this.getWeatherForLonLat(longLat[0], longLat[1]);
            // this.getPhoto(longLat[0], longLat[1]);

        });
    }

    useUserLatLon(lat, lon) {

        //console.log(lat);
        //console.log(lon);
        this.reverseGeoCodeLatLon(lat, lon)
        this.getWeatherForLonLat(lat, lon)

    }

    reverseGeoCodeLatLon(lat, lon) {
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=` + lat + `,` + lon + `&key=AIzaSyDgzBCW7mzyq7jXQf-g66Tbe259qF_luNo`).then(res => {

            var data = res.data
            //console.log(data);
            var firstAddress = data.results[0].formatted_address
            //var firstCity = data.results[0].address_components[2].long_name
            //console.log(data.results[0].address_components);

            this.setState({userLocationName: firstAddress})
        });
    }

    getLatLonForLocation(locationName) {
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=` + locationName + `&region=GB&key=AIzaSyDgzBCW7mzyq7jXQf-g66Tbe259qF_luNo`).then(res => {

            var data = res.data
            //console.log(res);
            console.log(data);
            var locLatLong = data.results[0].geometry.location

            var locLat = locLatLong.lat
            var locLon = locLatLong.lng
            //console.log(locLat);
            //console.log(locLon);

            this.setState({
                userLat: locLat,
                userLon: locLon
            }, this.useUserLatLon(locLat, locLon))

        });
    }

    getWeatherForLonLat(lat, lon) {
        //console.log("Looking for weather at: " + lat + " : " + lon);
        axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=` + lat + `&lon=` + lon + `&appid=a2dd8fbe4eb31d443c145a6ade942558&lang=en-GB&units=metric`).then(res => {

            var data = res.data
            //console.log(data);

            var tempratureC = data.main.temp
            var tempratureF = (tempratureC * 9 / 5) + 32;

            var tempObj = this.state.weatherTemp
            //console.log(tempObj);

            tempObj[0].value = tempratureC;
            tempObj[1].value = tempratureF;

            //console.log(tempObj);

            this.setState({
                weatherText: data.weather[0].main,
                weatherTemp: tempObj
            }, function() {
                this.getPhoto(lat, lon)
            })
            // data.weather[0].main
            // "Rain"

            // data.weather[0].description
            // "light rain"
        });
    }

    getPhoto(lat, lon) {

        //var weatherText = this.state.weatherText

        axios.get(`https://api.500px.com/v1/photos/search?geo=` + lat + `,` + lon + `,5mi&only=Landscapes&sort=times_viewed&image_size=600&consumer_key=OcrrAVasiOFncBq9oyZQSQ4LeKTePpu5JlEbhxbh`).then(res => {

            var data = res.data
            //console.log(data);

            // Set Photo Array to be all photos
            this.setState({
                photoArr: data.photos
            }, function() {
                this.chooseRandomPhoto();
            })

        });
    }

    chooseRandomPhoto() {
        var photos = this.state.photoArr

        var rnd = Math.floor(Math.random() * photos.length - 1) + 1

        var chosenPhoto = photos[rnd]
        //console.log(chosenPhoto);
        //console.log(chosenPhoto.name); - This is a bit crap sometimes
        //console.log(chosenPhoto.description);

        var photoURL = chosenPhoto.image_url
        var photoDescription = chosenPhoto.description
        //console.log(photoLoc);
        this.setState({photo: photoURL, photoDescription: photoDescription})
    }

    toggleTempFormat() {

        var currentFormat = this.state.tempFormat;
        //console.log(currentFormat);

        if (currentFormat === "C") {
            this.setState({tempFormat: "F"})
        } else {
            this.setState({tempFormat: "C"})
        }
    }



    render() {

        var divStyle = {
            backgroundImage: 'url(' + this.state.photo + ')'
        }

        var showTempFormat;

        if (this.state.tempFormat === "C") {
            showTempFormat = <span>{this.state.weatherTemp[0].value}
                <span className="deg">&deg;{this.state.weatherTemp[0].format}</span>
            </span>;
        } else {
            showTempFormat = <span>{this.state.weatherTemp[1].value}
                <span className="deg">&deg;{this.state.weatherTemp[1].format}</span>
            </span>;
        }



        return (
            <div className="App">

                <div className="locationSearchbox">


                    <Autocomplete style={{
                        width: '90%'
                    }} onPlaceSelected={(place) => {
                        console.log(place);

                        this.setState({searchLocationText: place.formatted_address}, function(){
                          this.getLatLonForLocation(place.formatted_address)
                        })
                    }} types={['(regions)']} />

                </div>

                <div className="PhotoCard" style={divStyle}>

                    <div className="chartWrapper">
                        <canvas id="myChart" className="chart"></canvas>
                    </div>

                    <div className="textWrapper">
                        <div className="leftSide">
                            <div>
                                <div className="cwTitle">Current Weather:</div>
                                <div className="cw">{this.state.weatherText}</div>
                            </div>
                            <div>
                                <div className="clTitle">Current Location:</div>
                                <div className="cl">{this.state.userLocationName}</div>
                            </div>
                        </div>

                        <div className="rightSide" onClick={this.toggleTempFormat.bind(this)}>

                            <div>
                                <div className="ctTitle">Current Temprature</div>
                                <div className="ct">
                                    {showTempFormat}

                                </div>

                            </div>
                        </div>

                    </div>

                    <div className="textWrapperBottom">
                        {this.state.photoDescription}
                    </div>
                </div>

                <div className="actionButtons" onClick={this.chooseRandomPhoto.bind(this)}>
                    Change Photo
                </div>
            </div>
        );
    }
}

export default App;
