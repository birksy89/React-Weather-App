import React, {Component} from 'react';
//import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Chart from 'chart.js'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ipInfo: 'Loading...',
            weather: 'Loading...',
            weatherMain: 'Loading...',
            photo: 'Loading...',
            locationName: 'Loading...'
        };
    }

    componentDidMount() {
        this.getUserLocationBrowser()

        var ctx = document.getElementById("myChart");

        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [
                    "Red",
                    "Blue",
                    "Yellow",
                    "Green",
                    "Purple",
                    "Orange"
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
                            8
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
                                beginAtZero: true
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
            console.log("Using Browser");
            navigator.geolocation.getCurrentPosition(success, error)
            function success(pos) {
                var crd = pos.coords;

                _self.getWeatherForLonLat(crd.longitude, crd.latitude);
                _self.getPhoto(crd.latitude, crd.longitude);

                // console.log('Your current position is:');
                // console.log('Latitude : ' + crd.latitude);
                // console.log('Longitude: ' + crd.longitude);
                // console.log('More or less ' + crd.accuracy + ' meters.');
            };

            function error(err) {
                console.warn('ERROR(' + err.code + '): ' + err.message);
                //Should Revert to other system if user denys Browser Location
            };
        } else {
            this.getUserLocationIP()
        }

    }

    getUserLocationIP() {
        console.log("USing IP");
        axios.get(`http://ipinfo.io`).then(res => {
            var data = res.data
            console.log(data);
            this.setState({ipInfo: data})

            var longLat = data.loc.split(",");
            console.log(longLat);

            this.getWeatherForLonLat(longLat[0], longLat[1]);
            this.getPhoto(longLat[0], longLat[1]);

        });
    }

    getWeatherForLonLat(lon, lat) {
        console.log(lon + " : " + lat);
        axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=` + lat + `&lon=` + lon + `&appid=a2dd8fbe4eb31d443c145a6ade942558&lang=en-GB&units=metric`).then(res => {

            var data = res.data
            console.log(data);

            this.setState({weather: data.weather[0].main, weatherMain: data.main})
        });
    }

    getPhoto(lat, lon) {
        axios.get(`https://api.500px.com/v1/photos/search?geo=` + lat + `,` + lon + `,5mi&only=Landscapes&sort=times_viewed&image_size=600&consumer_key=OcrrAVasiOFncBq9oyZQSQ4LeKTePpu5JlEbhxbh`).then(res => {

            var data = res.data
            console.log(data);

            var rnd = Math.floor(Math.random() * 20) + 1

            var photoURL = data.photos[rnd].image_url
            var photoLoc = data.photos[rnd].location_details
            //console.log(photoLoc);
            this.setState({photo: photoURL, locationName: photoLoc.city[0]})

        });
    }

    render() {

        var divStyle = {
            backgroundImage: 'url(' + this.state.photo + ')'
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
                                <div className="cw">{this.state.weather}</div>
                            </div>
                            <div>
                                <div className="clTitle">Current Location:</div>
                                <div className="cl">{this.state.locationName}</div>
                            </div>
                        </div>

                        <div className="rightSide">

                            <div>
                                <div className="ctTitle">Current Temprature</div>
                                <div className="ct">{this.state.weatherMain.temp}
                                    <span className="degC">&deg;c</span>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>

            </div>
        );
    }
}

export default App;
