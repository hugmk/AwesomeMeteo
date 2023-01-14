import * as React from 'react';
import { useState, useReducer, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, FlatList, Image, Alert } from 'react-native';
import City from '../classes/City.js';
import Meteo from '../classes/Meteo.js';
import { ManageNotification } from './ManageNotification'
import AsyncStorage from '@react-native-async-storage/async-storage';
import GestureRecognizer from 'react-native-swipe-gestures';
import { Subject } from 'rxjs';

const WEATHER_API_KEY = '63a5ba9022efff0b31f27831ff862eac';
const METEO_CALL_INTERVAL = 300000; // 5 minutes
const updatingCities = new Subject();
var cities: City[] = [];

export default function Cities() {
  const [city, setCity] = useState('');
  const [list, setList] = useState([]);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  updatingCities.subscribe(async (cities) => {
    setList(cities);
  })

  const addCityToList = async (city: String) => {
    if(city && city.length > 2) {
      let newCity = await addCity(city);
      if(newCity) {
        await getCityMeteo(newCity);
        setList(cities);
        setCity('');
      }
    }
  }

  const getCitiesMeteo = async () => {
    await getMeteo();
    setList(cities);
    forceUpdate();
  }

  const initCities = async () => {
    console.log("INITIALIZING LIST");
    var storedCities = await storageGetAllStoredCities();
    console.log(storedCities.length);
    for(var city in storedCities) {
      let cityToAdd = JSON.parse(storedCities[city][1]);
      cities.push(cityToAdd);
    }
    await getCitiesMeteo();
  }

  const getIntervalMeteo = async () => {
    var oldCities = JSON.parse(JSON.stringify(cities));
    await getCitiesMeteo();
    ManageNotification(oldCities, cities);
  }

  useEffect(() => {
    initCities();
    const interval = setInterval(() => {
      getIntervalMeteo();
    }, METEO_CALL_INTERVAL);
    return () => clearInterval(interval);
    }, []
  );

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

async function addCity(city: String) {
  console.log("city : " + city);
  let retrievedCity = await storageGetCity(city);
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
        cityInfo.lon,
        null
      );
      cities.push(newCity);
      await storageSaveCity(newCity);
      return newCity;
    }     
  }    
}

function alertCityAdd(msg: String) {
  Alert.alert(
    "Impossible d'ajouter la ville",
    msg,
    [
      { text: "OK", onPress: () => console.log("OK Pressed") }
    ]
  );
}

async function getCityInfo(request) {
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
            <View style={styles.metoContent}>
              <View style={styles.meteoIcon}>
                <Image source={{uri: 'https://openweathermap.org/img/wn/'+city.meteo.weatherIcon+'@2x.png'}}
                    style={{width: 50, height: 50}} />
              </View>              
              <Text style={styles.temperature}>{city.meteo?.temperature}°C</Text>
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

function callDeleteCity(cityName) {
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

async function deleteCityByName(cityName) {
  await storageRemoveCity(cityName);
  const filteredData = cities.filter(item => item.name !== cityName);
  cities = filteredData;
  updatingCities.next(cities);
}

function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const storageSaveCity = async (city: City) => {
  try {
    await AsyncStorage.setItem(city.name.toLowerCase(), JSON.stringify(city));
  } catch (e) {
    console.log(e);
  }
}

const storageGetCity = async (cityName) => {
  try {
    const jsonValue = await AsyncStorage.getItem(cityName.toLowerCase());
    console.log(jsonValue);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    console.log(e);
  }
}

const storageRemoveCity = async (cityName) => {
  try {
    await AsyncStorage.removeItem(cityName.toLowerCase());
  } catch(e) {}
}

const storageGetAllStoredCities = async () => {
  try {
    let keys = [];
    keys = await AsyncStorage.getAllKeys();
    let values;
    values = await AsyncStorage.multiGet(keys);
    console.log("ALL VALUES FROM STORAGE :");
    console.log(values);

    return values;
  } catch(e) {
    console.log(e);
  }
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
  metoContent: {
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