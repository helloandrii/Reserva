import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Location permission required',
                    'We need access to your location to show your position on the map.',
                );
                setHasLocationPermission(false);
                return;
            }

            setHasLocationPermission(true);
        })();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                showsUserLocation={hasLocationPermission === true}
                followsUserLocation={hasLocationPermission === true}
                initialRegion={{
                    latitude: 48.1486,
                    longitude: 17.1077,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
