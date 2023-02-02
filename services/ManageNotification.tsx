import PushNotification from 'react-native-push-notification';
import City from '../classes/City';

export function ManageNotification(oldCities: City[], newCities: City[]) {
    // var demoOldCities: City[] = [
    //   { name: 'Nice',
    //     latitude: 43.7009358,
    //     longitude: 7.2683912,
    //     meteo: 
    //     { weatherDesc: 'Nuageux',
    //       weatherIcon: '04d',
    //       temperature: 14,
    //       windSpeed: 2.06 }
    //   },
    //   { name: 'Paris',
    //     latitude: 48.8588897,
    //     longitude: 2.3200410217200766,
    //     meteo: 
    //     { weatherDesc: 'Nuageux',
    //       weatherIcon: '04d',
    //       temperature: 9,
    //       windSpeed: 10.8 } 
    //   } 
    // ];

    // var demoNewCities: City[] = [
    //   { name: 'Nice',
    //     latitude: 43.7009358,
    //     longitude: 7.2683912,
    //     meteo: 
    //     { weatherDesc: 'Pluie légère',
    //       weatherIcon: '04d',
    //       temperature: 14,
    //       windSpeed: 2.06 }
    //   },
    //   { name: 'Paris',
    //     latitude: 48.8588897,
    //     longitude: 2.3200410217200766,
    //     meteo: 
    //     { weatherDesc: 'Nuageux',
    //       weatherIcon: '04d',
    //       temperature: 10,
    //       windSpeed: 10.8 } 
    //   } 
    // ];  
    // var res = compareMeteo(demoOldCities, demoNewCities);

    var res = compareMeteo(oldCities, newCities);

    if(res && res.length > 0) {
      res.forEach(notif => {
        PushNotification.getChannels((channelIds) => {
          PushNotification.localNotification({
            channelId: channelIds[0],
            title: notif.title,
            message: notif.message
          });
        });
      });
    }
    else {
      console.log("nothing to notify");
    } 
}

function compareMeteo(oldCities: City[], newCities: City[]) {
  var result = [];

  for(let i = 0; i < newCities.length; i++) {    
    var oldCity = oldCities.find(obj => obj.name === newCities[i].name);
    if(oldCity && oldCity.meteo) {
      var title = "";
      var message = "";

      if(oldCity.meteo.weatherDesc !== newCities[i].meteo?.weatherDesc) {
        title = "🌜 Changement de météo à " + newCities[i].name;
        message = "La météo à " + newCities[i].name + " est désormais : " + newCities[i].meteo!.weatherDesc;
      }

      else if(oldCity.meteo.temperature !== newCities[i].meteo?.temperature) {
        title = "🌡️ Changement de température à " + newCities[i].name;
        if(oldCity.meteo.temperature < newCities[i].meteo!.temperature){
          message = "Il fait un peu plus chaud à " + newCities[i].name + ": "+ newCities[i].meteo!.temperature + "°C";
        }
        else {
          message = "Il fait un peu plus froid à " + newCities[i].name + ": "+ newCities[i].meteo!.temperature + "°C";
        }
      }

      else if(oldCity.meteo.windSpeed !== newCities[i].meteo?.windSpeed) {
        title = "🌬️ La vitesse du vent change à " + newCities[i].name;
        if(oldCity.meteo.windSpeed < newCities[i].meteo!.windSpeed) {
          message = "Le vent se lève à " + newCities[i].name;
        }
        else {
          message = "Le vent se calme à " + newCities[i].name;
        }
      }

      if(title && message) {
        result.push({title, message});
      }
    }
  }

  console.log(result);
  return result;
}