import React, {useEffect, useRef, useState} from "react";
import {Animated, Dimensions, Easing, StyleSheet, Text, View} from "react-native";
import Colors from "@/constants/Colors";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

export const TimerCurtain = ({initialSeconds, finished}) => {
    const [seconds, setSeconds] = useState(initialSeconds);

    const animatedColor = useRef(new Animated.Value(0)).current;
    const translateYValue = useRef(new Animated.Value(screenHeight)).current;

    useEffect(() => {
        if (seconds <= 0) {
            finished(true);
        }

        Animated.timing(translateYValue, {
            toValue: 0,
            duration: seconds * 1000,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();

        const intervalId = setInterval(() => {
            setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [seconds]);

    useEffect(() => {
        Animated.timing(animatedColor, {
            toValue: 1 - seconds / initialSeconds, // Calc percentage for color
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [seconds]);

    const backgroundColor = animatedColor.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [Colors.workoutTimer.start, Colors.workoutTimer.middle, Colors.workoutTimer.end],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.animatedBackground,
                    {width: screenWidth, backgroundColor: backgroundColor, transform: [{translateY: translateYValue}]},
                ]}
            />
            <Text style={styles.timerText}>{seconds}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        width: "100%",
    },
    animatedBackground: {
        position: "absolute",
        height: "100%",
    },
    timerText: {
        fontSize: 30,
        color: Colors.dark.connected,
        fontWeight: "bold",
    },
});