import AsyncStorage from '@react-native-async-storage/async-storage';
import City from '../classes/City';

const Storage = {
    storageSaveCity: async (city: City) => {
        try {
          await AsyncStorage.setItem(city.name.toLowerCase(), JSON.stringify(city));
        } catch (e) {
          console.log(e);
        }
    },
    storageGetCity: async (cityName: string) => {
        try {
            const jsonValue = await AsyncStorage.getItem(cityName.toLowerCase());
            console.log(jsonValue);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch(e) {
            console.log(e);
        }
    },
    storageRemoveCity: async (cityName: string) => {
        try {
            await AsyncStorage.removeItem(cityName.toLowerCase());
        } catch(e) {}
    },
    storageGetAllStoredCities: async () => {
        try {
            let keys = await AsyncStorage.getAllKeys();
            let values;
            values = await AsyncStorage.multiGet(keys);
            console.log("ALL VALUES FROM STORAGE :");
            console.log(values);
    
            return values;
        } catch(e) {
            console.log(e);
        }
    }
};

export default Storage;