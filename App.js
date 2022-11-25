import React from 'react';
import type {Node} from 'react';
import Cities from './components/Cities.js';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';


const App: () => Node = () => {
  return (
    <SafeAreaView>
      <View>
        <Cities />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
