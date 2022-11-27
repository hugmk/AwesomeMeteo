import React from 'react';
import type {Node} from 'react';
import Cities from './components/Cities.js';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text
} from 'react-native';

const App: () => Node = () => {
  return (
    <SafeAreaView style={styles.appContent}>
      <View style={{flex: 1, width: '100%'}}>
        <View style={styles.titleContainer}>
          <Text style={styles.awesomeText}>awesome</Text>
          <Text style={styles.meteoText}>meteo</Text>
        </View>        
        <Cities />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appContent: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: "#000000",
    width: '100%',
    height: '100%'
  },
  titleContainer: {
    width: '100%'
  },
  awesomeText: {
    fontFamily: "BarlowCondensed-BoldItalic",
    fontSize: 80,
    lineHeight: 80,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textTransform: 'uppercase',
    color: "#75C7FB",
    textShadowColor: "rgba(211, 47, 35, 0.6)",
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 2,
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'bottom',
  },
  meteoText: {
    fontFamily: "BarlowCondensed-BoldItalic",
    fontSize: 80,
    lineHeight: 80,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textTransform: 'uppercase',
    color: "#FF3847",
    textShadowColor: 'rgba(211, 47, 35, 0.6)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 2,
    width: '100%',
    textAlign: 'center',
  }
});

export default App;
