
export default class Meteo {

    weatherDesc: string;
    weatherIcon: string;
    temperature: Number;
    windSpeed: Number;

    constructor(weatherDesc: string, weatherIcon: string, temperature: Number, windSpeed: Number) {
        this.weatherDesc = weatherDesc;
        this.weatherIcon = weatherIcon;
        this.temperature = temperature;
        this.windSpeed = windSpeed;
    }
}