import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ipInfo: 'Loading...',
            weather: 'Loading...'
        };
    }

    componentDidMount() {
        this.getIpInfo()
    }

    getIpInfo() {
        axios.get(`http://ipinfo.io`).then(res => {
            var data = res.data
            console.log(data);
            this.setState({ipInfo: data})

            var longLat = data.loc.split(",");
            console.log(longLat);

            this.getWeatherForLonLat(longLat[0], longLat[1])

        });
    }

    getWeatherForLonLat(lon, lat) {
        console.log(lon + " : " + lat);
        axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=` + lat + `&lon=` + lon + `&appid=a2dd8fbe4eb31d443c145a6ade942558&lang=en-GB`).then(res => {

            var data = res.data
            console.log(data);

            var weatherData = data.weather[0];
            console.log(weatherData);

            console.log(weatherData.description);

            this.setState({weather: weatherData.description})
        });
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h2>Welcome to My Weather App</h2>
                </div>
                <h2 className="App-intro">
                The current weather for {this.state.ipInfo.city}, {this.state.ipInfo.region} is {this.state.weather}
                </h2>
                <p>{this.state.ipInfo.region}</p>

            </div>
        );
    }
}

export default App;
