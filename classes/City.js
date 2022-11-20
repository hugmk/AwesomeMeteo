import Meteo from "./Meteo";

export default class City {

    name: String;
    latitude: String;
    longitude: String;
    meteo: Meteo;

    constructor(name, latitude, longitude, meteo) {
      this.name = name;
      this.latitude = latitude;
      this.longitude = longitude;
      this.meteo = meteo;
    }
}