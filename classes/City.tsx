import Meteo from "./Meteo";

export default class City {

    name: string;
    latitude: string;
    longitude: string;
    meteo: Meteo | undefined;

    constructor(name: string, latitude: string, longitude: string, meteo?: Meteo | undefined) {
      this.name = name;
      this.latitude = latitude;
      this.longitude = longitude;
      this.meteo = meteo;
    }
}