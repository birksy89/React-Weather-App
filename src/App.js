import React, {Component} from 'react';
//import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Chart from 'chart.js'

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
            photoURL: "https://cache-graphicslib.viator.com/graphicslib/thumbs674x446/3675/SITours/hong-kong-island-half-day-tour-in-hong-kong-114439.jpg",
            photoDescription: ""
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
                _self.setState({userLat: crd.latitude, userLon: crd.longitude}, _self.useUserLatLon(crd.latitude,crd.longitude) )



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
        axios.get(`http://ipinfo.io`).then(res => {
            var data = res.data
            //console.log(data);
            var LatLon = data.loc.split(",");
            //console.log(LatLon);
            var lat = LatLon[0]
            var lon = LatLon[1]
            //console.log(lat);
            //console.log(lon);

            this.setState({userLat: lat, userLon: lon}, this.useUserLatLon(lat,lon))


            //
            // this.getWeatherForLonLat(longLat[0], longLat[1]);
            // this.getPhoto(longLat[0], longLat[1]);

        });
    }

    useUserLatLon(lat,lon){

      //console.log(lat);
      //console.log(lon);

      this.getWeatherForLonLat(lat, lon)
      this.getPhoto(lat, lon)
    }


    getWeatherForLonLat(lat, lon) {
        //console.log("Looking for weather at: " + lat + " : " + lon);
        axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=` + lat + `&lon=` + lon + `&appid=a2dd8fbe4eb31d443c145a6ade942558&lang=en-GB&units=metric`).then(res => {

            var data = res.data
            //console.log(data);

            var tempratureC = data.main.temp
            var tempratureF = (tempratureC * 9/5) + 32;

            var tempObj = this.state.weatherTemp
            //console.log(tempObj);

            tempObj[0].value = tempratureC;
            tempObj[1].value = tempratureF;

            //console.log(tempObj);

            this.setState({weatherText: data.weather[0].main, weatherTemp: tempObj})
            // data.weather[0].main
            // "Rain"

            // data.weather[0].description
            // "light rain"
        });
    }

    getPhoto(lat, lon) {
        axios.get(`https://api.500px.com/v1/photos/search?geo=` + lat + `,` + lon + `,2mi&only=Landscapes&sort=times_viewed&image_size=600&consumer_key=OcrrAVasiOFncBq9oyZQSQ4LeKTePpu5JlEbhxbh`).then(res => {

            var data = res.data
            //console.log(data);

            var rnd = Math.floor(Math.random() * data.photos.length-1) + 1

            var chosenPhoto = data.photos[rnd]
            //console.log(chosenPhoto);
            //console.log(chosenPhoto.name); - This is a bit crap sometimes
            //console.log(chosenPhoto.description);

            var photoURL = chosenPhoto.image_url
            //console.log(photoLoc);
            this.setState({photo: photoURL, photoDescription: chosenPhoto.description})

        });
    }

    toggleTempFormat(){

      var currentFormat = this.state.tempFormat;
      //console.log(currentFormat);

      if(currentFormat === "C"){
        this.setState({
          tempFormat: "F"
        })
      }
      else{
        this.setState({
          tempFormat: "C"
        })
      }
    }

    render() {

        var divStyle = {
            backgroundImage: 'url(' + this.state.photo + ')'
        }

        var showTempFormat;

        if(this.state.tempFormat === "C"){
          showTempFormat = <span>{this.state.weatherTemp[0].value} <span className="deg">&deg; {this.state.weatherTemp[0].format}</span></span>;
        }
        else{
            showTempFormat = <span>{this.state.weatherTemp[1].value} <span className="deg">&deg; {this.state.weatherTemp[1].format}</span> </span>;
        }

        return (
            <div className="App">

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
                                <div className="cl">{this.state.locationName}</div>
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

            </div>
        );
    }
}

export default App;
