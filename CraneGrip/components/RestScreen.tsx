import {Pressable, StyleSheet, Text, View} from "react-native";
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer'
import Colors from "@/constants/Colors";

type RestScreenProps = {
    message: string;
    restTime: number;
    isRunning: (running: boolean) => void;
    onSkip?: () => void;
    showSkipButton?: boolean;
};

export const RestScreen = ({message, restTime, isRunning, onSkip, showSkipButton = true}: RestScreenProps) => {
    const timesUp = () => {
        isRunning(false);
        onSkip && onSkip();
    };

    return (
        <View style={styles.container}>
            <CountdownCircleTimer
                isPlaying
                duration={restTime}
                colors={[Colors.restTimer.start, Colors.restTimer.middle, Colors.restTimer.end, Colors.restTimer.background]}
                colorsTime={[7, 5, 2, 0]}
                onComplete={() => {
                    timesUp();
                    return { shouldRepeat: false };
                }}
            >
                {({ remainingTime }) => (
                    <>
                        <Text style={styles.timerText}>{message}</Text>
                        <Text style={styles.timerText}>{remainingTime} s</Text>
                    </>
                )}
            </CountdownCircleTimer>
            {showSkipButton && onSkip ? (
                <Pressable accessibilityRole="button" style={styles.skipButton} onPress={timesUp}>
                    <Text style={styles.skipText}>Skip</Text>
                </Pressable>
            ) : null}
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
    infoText: {
        fontSize: 20,
        color: "black",
        fontWeight: "bold",
        paddingTop: 10,
    },
    skipButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: Colors.dark.resetButton,
    },
    skipText: {
        color: Colors.dark.text,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});


