import * as React from 'react';
import { useState } from 'react';
import { View, StyleSheet, TextInput, StatusBar, Button, Text, FlatList } from 'react-native';
import City from '../classes/City.js';

const cities: City[] = [];

export default function Cities() {
  const [city, setCity] = useState('');
  const [list, setList] = useState([]);

  const addCityToList = (city) => {
    addCity(city);
    setList(cities);
    setCity('');
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
      <FlatList
        data={list}
        renderItem={({item}) => <Text>{item.name}</Text>}
      />
    </View>
  );
}

async function addCity(city: String) {
    var request = 'http://api.openweathermap.org/geo/1.0/direct?q='+city+'&limit=1&appid=63a5ba9022efff0b31f27831ff862eac';
    var cityInfo = await getCityInfo(request);
    let newCity = new City(
        cityInfo.local_names.fr,
        cityInfo.lat,
        cityInfo.lon
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
  }
});