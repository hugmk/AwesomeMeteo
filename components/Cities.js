import * as React from 'react';
import { useState, useReducer } from 'react';
import { View, StyleSheet, TextInput, StatusBar, Button, Text, FlatList, Image, Alert, Animated } from 'react-native';
import City from '../classes/City.js';
import Meteo from '../classes/Meteo.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GestureRecognizer from 'react-native-swipe-gestures';
import { Subject } from 'rxjs';

const WEATHER_API_KEY = '63a5ba9022efff0b31f27831ff862eac';
const deletingCity = new Subject();
var cities: City[] = [];
var isFirstLoad = true;

export default function Cities() {
  const [city, setCity] = useState('');
  const [list, setList] = useState([]);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  deletingCity.subscribe(async (nextCity: String) => {
    await deleteCityByName(nextCity);
  })

  const addCityToList = async (city) => {
    await addCity(city);
    setList(cities);
    setCity('');
  }

  const getCitiesMeteo = async () => {
    await getMeteo();
    setList(cities);
    forceUpdate();
  }

  const deleteCityByName = async (cityName) => {
    await storageRemoveCity(cityName);
    const filteredData = list.filter(item => item.name !== cityName);
    cities = filteredData;
    setList(filteredData);
  }

  const initCities = async () => {
    isFirstLoad = false;
    var storedCities = await storageGetAllStoredCities();
    console.log(storedCities.length);
    for(var city in storedCities) {
      let cityToAdd = JSON.parse(storedCities[city][1]);
      cities.push(cityToAdd);
    }
    setList(cities);    
  }

  if(isFirstLoad) {
    initCities();
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Ajouter une ville +"
        placeholderTextColor="#000"
        onChangeText={newText => {setCity(newText);}}
        defaultValue={city}
      />
      <Button
        onPress={async () => {await addCityToList(city)}}
        title="Ajouter"
        color="#004"
      />
      <Button
        onPress={async () => {await getCitiesMeteo()}}
        title="Récupérer la météo"
        color="#004"
      />
      <Button
        onPress={async () => {await storageGetAllStoredCities()}}
        title="getstoragelist (see logs)"
        color="#004"
      />
      <FlatList
        data={list}
        renderItem={({item}) => renderCity(item)}
      />
      
    </View>
  );
}

async function addCity(city: String) {
  console.log("city : " + city);
  let retrievedCity = await storageGetCity(city);
    if(retrievedCity != null) { //city is in the list, don't add it, alert
      console.log("get city returned not null, so alert");
      let alertMsg = "La ville " + city + " a déjà ajoutée";
      alertCityAdd(alertMsg);
    }
    else { //city is not in the list, add it
      var request = 'http://api.openweathermap.org/geo/1.0/direct?q='+city+'&limit=1&appid='+WEATHER_API_KEY;
      var cityInfo = await getCityInfo(request);
      if(!cityInfo || !cityInfo.local_names) { //city not found
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
        console.log("ADD FINISHED, CHECKING STORAGE");
        await storageGetAllStoredCities();
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
            <Text style={styles.cityText}>{city.name} : {city.meteo.weatherDesc} | {city.meteo?.temperature}°C</Text>
            <Image source={{uri: 'https://openweathermap.org/img/wn/'+city.meteo.weatherIcon+'@2x.png'}}
                style={{width: 50, height: 50}} />
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
      { text: "Supprimer", onPress: () => deletingCity.next(cityName) }
    ]
  );
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
    flexDirection: 'column',
    marginTop: StatusBar.currentHeight || 0
  },
  input: {
    padding: 10,
    fontSize: 26,
    height: 44,
    color: 'black'
  },
  city: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "green"
  },
  cityText: {
    fontSize: 18
  }
});