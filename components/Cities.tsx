import * as React from 'react';
import { useState, useReducer, useEffect } from 'react';
import { AppState, View, StyleSheet, TextInput, Text, FlatList, Image, Alert } from 'react-native';
import { Subject } from 'rxjs';
import GestureRecognizer from 'react-native-swipe-gestures';
import BackgroundService from 'react-native-background-actions';
import { ManageNotification } from '../services/ManageNotification';
import City from '../classes/City';
import Meteo from '../classes/Meteo';
import Storage from '../services/Storage';
import { WEATHER_API_KEY } from '@env';

const METEO_CALL_INTERVAL = 300000; // 5 minutes
const updatingCities = new Subject();
var cities: City[] = [];
var isFirstLoad = true;
var interval: NodeJS.Timer;

export default function Cities() {
  const [city, setCity] = useState('');
  const [list, setList] = useState([]);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const options = {
    taskName: 'Background',
    taskTitle: 'Background working...',
    taskDesc: 'Background',
    taskIcon: { 
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'yourSchemeHere://chat/jane',
    parameters: {
        delay: 1000,
    },
  };

  updatingCities.subscribe(async (cities: any) => {
    setList(cities);
  })

  const addCityToList = async (city: string) => {
    if(city && city.length > 2) {
      let newCity = await addCity(city);
      if(newCity) {
        await getCityMeteo(newCity);
        setList(cities as any);
        setCity('');
      }
    }
  }

  const getCitiesMeteo = async () => {
    await getMeteo();
    setList(cities as any);
    forceUpdate();
  }

  const initCities = async () => {
    console.log("INITIALIZING LIST");
    cities = [];
    stopBackgroundTask();
    var storedCities = await Storage.storageGetAllStoredCities();
    console.log(storedCities?.length);
    for(var city in storedCities) {
      let cityToAdd = JSON.parse(storedCities[city as any][1] as string);
      cities.push(cityToAdd);
    }
    await getCitiesMeteo();
    isFirstLoad = false;
  }

  const getIntervalMeteo = async () => {
    var oldCities = JSON.parse(JSON.stringify(cities));
    await getCitiesMeteo();
    ManageNotification(oldCities, cities);
  }

  const backgroundTask = async (taskDataArguments: any) => {
    await new Promise( async (resolve) => {
        interval = setInterval(() => {
          getIntervalMeteo();
        }, METEO_CALL_INTERVAL);
        return () => clearInterval(interval);
    });
  };

  const startBackgroundTask = async () => {
    console.log("Starting background task...");
    await BackgroundService.start(backgroundTask, options);
  }

  const stopBackgroundTask = async () => {
    console.log("Stoping background task...");
    await BackgroundService.stop();
    clearInterval(interval);
  }

  useEffect(() => {
    if(isFirstLoad) {
      initCities();
    }
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log("App is in foreground");
        stopBackgroundTask();
      }
      else {
        console.log("App is in background");
        isFirstLoad = true;
        startBackgroundTask();
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Ajouter une ville +"
        placeholderTextColor="#FFFFFF"
        onChangeText={newText => {setCity(newText);}}
        defaultValue={city}
        onSubmitEditing={async () => {await addCityToList(city)}}
      />
      <View style={styles.meteoContainer}>
        <Text style={styles.myCitiesTitle}>Mes villes</Text>
        <FlatList
          data={list}
          renderItem={({item}) => renderCity(item)}
        />
      </View>      
    </View>
  );
}

async function addCity(city: string) {
  console.log("city : " + city);
  let retrievedCity = await Storage.storageGetCity(city);
  if(retrievedCity != null) { //city is in the list, don't add it, alert
    console.log("get city returned not null, so alert");
    let alertMsg = "La ville " + city + " a déjà été ajoutée";
    alertCityAdd(alertMsg);
  }
  else { //city is not in the list, add it
    var request = 'http://api.openweathermap.org/geo/1.0/direct?q='+city+'&limit=1&appid='+WEATHER_API_KEY;
    var cityInfo = await getCityInfo(request);
    if(!cityInfo || !cityInfo.local_names || !cityInfo.local_names.fr || !cityInfo.lat) { //city not found
      let alertMsg = "La ville " + city + " n'a pas été trouvée";
      alertCityAdd(alertMsg);
    }
    else {
      let newCity = new City(
        cityInfo.local_names.fr,
        cityInfo.lat,
        cityInfo.lon
      );
      cities.push(newCity);
      await Storage.storageSaveCity(newCity);
      console.log(newCity);
      return newCity;
    }     
  }    
}

function alertCityAdd(msg: string) {
  Alert.alert(
    "Impossible d'ajouter la ville",
    msg,
    [
      { text: "OK", onPress: () => console.log("OK Pressed") }
    ]
  );
}

async function getCityInfo(request: string) {
  try {
    const response = await fetch(request);
    const json = await response.json();
    return json[0];
  } catch (error) {
    console.error(error);
  }
}

async function getCityMeteo(city: City) {
  try {
    var request = 'https://api.openweathermap.org/data/2.5/weather?lat='+city.latitude+'&lon='+city.longitude+'&units=metric&lang=fr&appid='+WEATHER_API_KEY;
    const response = await fetch(request);
    const json = await response.json();
    console.log("json response");
    console.log(json);

    let meteoDesc = toTitleCase(json.weather[0].description);
    let meteoTemperature = Math.round(json.main.temp);
    
    let newMeteo = new Meteo(
      meteoDesc,
      json.weather[0].icon,
      meteoTemperature,
      json.wind.speed
    );
    city.meteo = newMeteo;
  } catch (error) {
    console.error(error);
  }
}

async function getMeteo() {
  for(var city of cities) {
    try {
      var request = 'https://api.openweathermap.org/data/2.5/weather?lat='+city.latitude+'&lon='+city.longitude+'&units=metric&lang=fr&appid='+WEATHER_API_KEY;
      const response = await fetch(request);
      const json = await response.json();
      console.log("json response");
      console.log(json);

      let meteoDesc = toTitleCase(json.weather[0].description);
      let meteoTemperature = Math.round(json.main.temp);
      
      let newMeteo = new Meteo(
        meteoDesc,
        json.weather[0].icon,
        meteoTemperature,
        json.wind.speed
      );
      city.meteo = newMeteo;
    } catch (error) {
      console.error(error);
    }
  }
}

function renderCity(city: City) {
  if(city.meteo) {
    return (
      <GestureRecognizer
        onSwipeLeft={() => callDeleteCity(city.name)}>
          <View style={styles.city}>
            <Text style={styles.cityText}>{city.name}</Text>
            <View style={styles.meteoContent}>
              <View style={styles.meteoIcon}>
                <Image source={{uri: 'https://openweathermap.org/img/wn/'+city.meteo.weatherIcon+'@2x.png'}}
                    style={{width: 50, height: 50}} />
              </View>
              <Text style={styles.temperature}>{city.meteo!.temperature}°C</Text>
            </View>
          </View>
      </GestureRecognizer>
    );
  }
  return (    
    <GestureRecognizer
      onSwipeLeft={() => callDeleteCity(city.name)}>
        <View style={styles.city}>
          <Text style={styles.cityText}>{city.name}</Text>
        </View>
    </GestureRecognizer>
  );
}

function callDeleteCity(cityName: string) {
  Alert.alert(
    "Confirmer la suppression",
    "Etes-vous sûr de vouloir retirer " + cityName + " de votre liste ?",
    [
      {
        text: "Annuler",
        style: "cancel"
      },
      { text: "Supprimer", onPress: async () => await deleteCityByName(cityName) }
    ]
  );
}

async function deleteCityByName(cityName: string) {
  await Storage.storageRemoveCity(cityName);
  const filteredData = cities.filter(item => item.name !== cityName);
  cities = filteredData;
  updatingCities.next(cities);
}

function toTitleCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 3,
    flexDirection: 'column',
    marginTop: 20,
  },
  input: {
    fontSize: 36,
    fontFamily: "BarlowCondensed-SemiBold",
    height: 44,
    color: '#FFFFFF',
    padding: 0
  },
  meteoContainer: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 20
  },
  myCitiesTitle: {
    fontFamily: "BarlowCondensed-BoldItalic",
    fontSize: 30,  
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'uppercase',
    color: "#FF3847",
    textShadowColor: 'rgba(211, 47, 35, 0.6)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 2,
  },
  city: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cityText: {
    fontSize: 25,
    fontFamily: "BarlowCondensed-SemiBold",
    color: "#FFFFFF",
    width: '70%'
  },
  meteoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '30%'
  },
  meteoIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0
  },
  temperature: {
    fontSize: 25,
    fontFamily: "BarlowCondensed-SemiBold",
    color: "#FFFFFF"
  }
});