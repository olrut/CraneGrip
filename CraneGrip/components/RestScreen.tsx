import {StyleSheet, Text, View} from "react-native";
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer'

export const RestScreen = ({message, restTime, isRunning}) => {
    const timesUp = () => {
        isRunning(false);
    }
    return (
        <View style={styles.container}>
            <CountdownCircleTimer
                isPlaying
                duration={restTime}
                colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                colorsTime={[7, 5, 2, 0]}
                onComplete={() => {
                    timesUp()
                    return {shouldRepeat: false}
                }}

            >
                {({remainingTime}) => <>
                    <Text style={styles.timerText}>{message}</Text>
                    <Text style={styles.timerText}>{remainingTime} s</Text>
                </>
                }
            </CountdownCircleTimer>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    animatedBackground: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    timerText: {
        fontSize: 30,
        color: "black",
        fontWeight: "bold",
    },
});


