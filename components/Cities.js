import * as React from 'react';
import { useState } from 'react';
import { View, StyleSheet, TextInput, StatusBar, Button, Text, FlatList, Image } from 'react-native';
import City from '../classes/City.js';
import Meteo from '../classes/Meteo.js';

const cities: City[] = [];
const apiKey = '63a5ba9022efff0b31f27831ff862eac';

export default function Cities() {
  const [city, setCity] = useState('');
  const [list, setList] = useState([]);

  const addCityToList = (city) => {
    addCity(city);
    setList(cities);
    setCity('');
  }

  const getCitiesMeteo = async () => {
    await getMeteo();
    setList(cities);
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
        onPress={() => {addCityToList(city)}}
        title="Ajouter"
        color="#004"
      />
      <Button
        onPress={() => {getCitiesMeteo()}}
        title="Récupérer la météo"
        color="#004"
      />
      <FlatList
        data={list}
        renderItem={({item}) => renderCity(item)}
        extraData={list}
      />
      
    </View>
  );
}

async function addCity(city: String) {
    var request = 'http://api.openweathermap.org/geo/1.0/direct?q='+city+'&limit=1&appid='+apiKey;
    var cityInfo = await getCityInfo(request);
    let newCity = new City(
        cityInfo.local_names.fr,
        cityInfo.lat,
        cityInfo.lon,
        null
    );
    cities.push(newCity);
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
  cities.forEach(async function(city) {
    try {
      var request = 'https://api.openweathermap.org/data/2.5/weather?lat='+city.latitude+'&lon='+city.longitude+'&units=metric&lang=fr&appid='+apiKey;
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
  });  
}

function renderCity(city: City) {
  if(city.meteo) {
    return (
      <View style={styles.city}>
        <Text style={styles.cityText}>{city.name} : {city.meteo.weatherDesc} | {city.meteo?.temperature}°C</Text>
        <Image source={{uri: 'https://openweathermap.org/img/wn/'+city.meteo.weatherIcon+'@2x.png'}}
              style={{width: 50, height: 50}} />
      </View>
      
    );
  }
  return (
    <View style={styles.city}>
      <Text style={styles.cityText}>{city.name}</Text>
    </View>    
  );  
}

function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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