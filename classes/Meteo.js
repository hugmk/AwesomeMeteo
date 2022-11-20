
export default class Meteo {

    weatherDesc: String;
    weatherIcon: String;
    temperature: Number;
    windSpeed: Number;

    constructor(weatherDesc, weatherIcon, temperature, windSpeed) {
        this.weatherDesc = weatherDesc;
        this.weatherIcon = weatherIcon;
        this.temperature = temperature;
        this.windSpeed = windSpeed;
    }
}