import Meteo from "./Meteo";

export default class City {

    name: string;
    latitude: number;
    longitude: number;
    meteo: Meteo | undefined;

    constructor(name: string, latitude: number, longitude: number, meteo?: Meteo | undefined) {
      this.name = name;
      this.latitude = latitude;
      this.longitude = longitude;
      this.meteo = meteo;
    }
}