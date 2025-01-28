import React, {useEffect, useRef, useState} from "react";
import {StyledView, Text} from "@/components/Themed";
import {WorkoutResults} from "@/types";
import {useSettings} from "@/components/SettingContext";
import {useFocusEffect} from "expo-router";
import {scanForScale, stopScan} from "@/components/ScaleConnect";
import {Alert, Pressable, StyleSheet, View} from "react-native";
import MaxLine from "@/components/MaxLine";
import ConnectionStatusBar from "@/components/ConnectionStatusBar";
import Colors from "@/constants/Colors";
import {CountdownCircleTimer} from "react-native-countdown-circle-timer";


interface MaxProps {
    finishWorkout: (save: boolean, results: WorkoutResults) => void;
}

export default function Endurance({save, finishWorkout}: MaxProps) {

    const Hands = {
        BOTH: "Both hands",
        RIGHT: "Right hand",
        LEFT: "Left hand",
    } as const;

    type HandType = typeof Hands[keyof typeof Hands];
    const [weight, setWeight] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const timeoutRef = useRef(null);

    const[currentMax, setCurrentMax] = useState(0);
    const [currentHand, setCurrentHand] = useState<HandType>(Hands.RIGHT);
    const [threshold, setThreshold] = useState(0);
    const maxLeftRef = useRef(0);
    const maxRightRef = useRef(0);
    const maxBothRef = useRef(0);
    const timeLeftRef = useRef(0);
    const timeRightRef = useRef(0);
    const timeBothRef = useRef(0);
    const [error, setError] = useState(null);
    const {settings} = useSettings();
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isRunning) {
            interval = setInterval(() => {
                setTimer((prevSeconds) => prevSeconds + 1);
            }, 1000);
        } else if (!isRunning && interval !== null) {
            clearInterval(interval);
        }
        // Clear interval on unmount
        return () => clearInterval(interval);
    }, [isRunning]);

    const updateMax = (weight: number) => {
        setThreshold((prev) => (weight > prev ? weight : prev));
        if (weight > settings.weighThreshold) {
            startTimer();
        } else if (isRunning) {
            const time = timer;

            switch (currentHand) {
                case Hands.BOTH:
                    timeBothRef.current = time;
                    break;
                case Hands.RIGHT:
                    timeRightRef.current = time;
                    break;
                case Hands.LEFT:
                    timeLeftRef.current = time;
                    break;
            }
            console.log("Time: " + time);
            resetTimer();
        }
    };

    const updateConnectionStatus = () => {
        setIsConnected(true);
        error && setError(null);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a timeout to disconnect if the scale is not found and the weight is not updated
        timeoutRef.current = setTimeout(() => {
            setIsConnected(false);
            setWeight(0);
        }, 2000);
    };

    const startTimer = () => {
        setIsRunning(true);
    };



    const resetTimer = () => {
        setIsRunning(false);
        setTimer(0);
    };

    const setNewWeight = (newWeight: number) => {
        setWeight(newWeight);
        updateMax(newWeight);
        updateConnectionStatus();
    }

    useFocusEffect(
        React.useCallback(() => {
            scanForScale(setNewWeight, setError);
            return () => {
                stopScan();
                setIsConnected(false);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }, [])
    );

    const finish = (save: boolean) => {
        switch (currentHand) {
            case Hands.BOTH:
                maxBothRef.current = threshold;
                break;
            case Hands.RIGHT:
                maxRightRef.current = threshold;
                break;
            case Hands.LEFT:
                maxLeftRef.current = threshold;
                break;
        }

        const results = {
            left: maxLeftRef.current,
            right: maxRightRef.current,
            both: maxBothRef.current,
            mode: "Endurance",
        };
        finishWorkout(save, results);
    }

    const resetMax = () => {
        setThreshold(0);
    };

    const changeHands = () => {
        setCurrentHand((prevHand) => {
            switch (prevHand) {
                case Hands.RIGHT:
                    maxRightRef.current = threshold;
                    setCurrentMax(maxLeftRef.current);
                    return Hands.LEFT;
                case Hands.LEFT:
                    maxLeftRef.current = threshold;
                    setCurrentMax(maxRightRef.current);
                    return Hands.RIGHT;
            }
        });
    };

    return (
        <>
            <StyledView style={styles.container}>
                <Text style={styles.header}>{settings.activeHold?.name} {settings.activeHold?.depth} mm</Text>
                <Text style={styles.header}>{currentHand}</Text>
                <Text style={styles.header}>{currentMax} s</Text>
                <CountdownCircleTimer
                    isPlaying
                    duration={7}
                    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                    colorsTime={[7, 5, 2, 0]}
                >
                    {({ remainingTime }) => <Text>{remainingTime}</Text>}
                </CountdownCircleTimer>
                <View style={styles.cards}>
                    <View style={styles.card}>
                        <Text style={styles.current}>
                            {timer} s
                        </Text>
                        <Text style={styles.kg}>
                            > {settings.weighThreshold} kg
                        </Text>
                    </View>
                </View>
                <View style={styles.line}>
                    <MaxLine
                        weight={weight}
                        maxWeight={threshold}
                        threshold={settings.weighThreshold}
                    />
                </View>

                <View style={styles.buttons}>
                    <Pressable style={styles.resetButton} onPress={() => resetMax()}>
                        <Text>Reset max</Text>
                    </Pressable>

                    {!settings.enduranceHands ?
                        <Pressable style={styles.nextButton}
                                   onPress={() => changeHands()}>
                            <Text>Change hands</Text>
                        </Pressable> : null
                    }

                    <Pressable style={styles.button} onPress={() => finish(true)}>
                        <Text>Finish workout</Text>
                    </Pressable>
                </View>
                <ConnectionStatusBar isConnected={isConnected} error={error}/>
            </StyledView>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 10,
        marginBottom: 10,
        fontSize: 35,
        textAlign: "center",
        color: Colors.dark.connected,
    },
    container: {
        paddingTop: 20,
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 0,
    },
    line: {
        flex: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: Colors.dark.card,
        borderRadius: 10,
        padding: 30,
        marginHorizontal: 12,
        marginTop: 30,
        alignItems: 'center',
        margin: 0,
    },
    cards: {
        flexDirection: "row",
        justifyContent: 'space-evenly',
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 5,
        padding: 3,
        marginTop: 0,
    },
    button: {
        flex: 1,
        marginHorizontal: 3,
        justifyContent: "center",
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: Colors.dark.confirmButton,
        padding: 20,
    },
    resetButton: {
        flex: 1,
        marginHorizontal: 3,
        justifyContent: "center",
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: Colors.dark.resetButton,
    },
    nextButton: {
        flex: 1,
        marginHorizontal: 3,
        justifyContent: "center",
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: Colors.dark.connected,
        padding: 20,
    },
    current: {
        fontSize: 40,
        color: Colors.dark.connected,
    },
    kg: {
        fontSize: 30,
    },
    maxval: {
        fontSize: 40,
        color: Colors.dark.resetButton,
    },
});