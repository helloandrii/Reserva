import { StyleSheet, Text, View } from 'react-native';

export default function ReservationScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Reservation</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
