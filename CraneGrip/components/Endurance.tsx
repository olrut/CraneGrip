import React, {useRef, useState} from "react";
import {StyledView, Text} from "@/components/Themed";
import {WorkoutHistoryItem, WorkoutResults} from "@/types";
import {useSettings} from "@/components/SettingContext";
import {useFocusEffect} from "expo-router";
import {scanForScale, stopScan} from "@/components/ScaleConnect";
import {Pressable, StyleSheet, View} from "react-native";
import ConnectionStatusBar from "@/components/ConnectionStatusBar";
import Colors from "@/constants/Colors";
import StopWatch from "@/components/StopWatch";
import {WorkoutTypes} from "@/types";
import { playBeep } from "@/components/sound";
import buttonStyles from "@/components/ButtonStyles";
interface MaxProps {
    finishWorkout: (save: boolean, results: WorkoutHistoryItem) => void;
}

export default function Endurance({finishWorkout}: MaxProps) {

    const Hands = {
        BOTH: "Both hands",
        RIGHT: "Right hand",
        LEFT: "Left hand",
    } as const;

    type HandType = typeof Hands[keyof typeof Hands];
    const [weight, setWeight] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const timeoutRef = useRef(null);
    const {settings} = useSettings();
    const [currentMax, setCurrentMax] = useState(0);
    const [currentHand, setCurrentHand] = useState<HandType>(settings.enduranceHands ? Hands.BOTH : Hands.RIGHT);
    const maxLeftRef = useRef(0);
    const maxRightRef = useRef(0);
    const maxBothRef = useRef(0);
    const timeLeftRef = useRef(0);
    const timeRightRef = useRef(0);
    const timeBothRef = useRef(0);
    const [error, setError] = useState(null);

    const [isRunning, setIsRunning] = useState(false);

    const updateMax = (weight: number) => {
        if (weight >= settings.weighThreshold) {
            if (!isRunning) {
                if (settings.beep) { try { playBeep(); } catch {} }
                setIsRunning(true);
            }
        } else {
            setIsRunning(false);
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
        const results: WorkoutHistoryItem = {
            time: new Date().toISOString(),
            type: WorkoutTypes.Endurance,
            hand: settings.enduranceHands ? "both" : "separate",
            left: timeLeftRef.current,
            right: timeRightRef.current,
            both: timeBothRef.current,
            hold: settings.activeHold,
        };

        finishWorkout(save, results);
    }

    const changeHands = () => {
        setCurrentHand((prevHand) => {
            switch (prevHand) {
                case Hands.RIGHT:
                    setCurrentMax(timeLeftRef.current);
                    return Hands.LEFT;
                case Hands.LEFT:
                    setCurrentMax(timeRightRef.current);
                    return Hands.RIGHT;
            }
        });
    };

    const saveTime = (time) => {
        time = time / 1000;
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
        setCurrentMax(time);
    }

    const resetMax = () => {
        switch (currentHand) {
            case Hands.BOTH:
                maxBothRef.current = 0;
                break;
            case Hands.RIGHT:
                maxRightRef.current = 0;
                break;
            case Hands.LEFT:
                maxLeftRef.current = 0;
                break;
        }
        setCurrentMax(0);
    }

    return (
        <>
            <StyledView style={styles.container}>
                <Text style={styles.header}>{settings.activeHold?.name} {settings.activeHold?.depth} mm @ {settings.weighThreshold} kg</Text>
                <StopWatch isRunning={isRunning} save={saveTime}></StopWatch>
                {isRunning ? <Text style={styles.header}>+ {Math.round((weight-settings.weighThreshold) * 100) / 100} kg</Text> : <Text style={styles.h2red}>Pull over {settings.weighThreshold} kg to start.</Text>}
                <Text style={styles.h2}>Best time: {currentMax} s</Text>
                <View style={styles.buttons}>
                    <Pressable style={buttonStyles.danger} onPress={() => resetMax()}>
                        <Text style={styles.buttonText}>Reset best time</Text>
                    </Pressable>

                    {!settings.enduranceHands ? (
                        <Pressable style={buttonStyles.neutral}
                                   onPress={() => changeHands()}>
                            <Text style={styles.buttonText}>Change hands</Text>
                        </Pressable>
                    ) : null}

                    <Pressable style={buttonStyles.primary} onPress={() => finish(true)}>
                        <Text style={styles.buttonText}>Finish workout</Text>
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
        fontSize: 35,
        textAlign: "center",
        color: Colors.dark.text,
    },
    h2: {
        fontSize: 24,
        textAlign: "center",
        color: Colors.dark.text,
    },
    h2red: {
        fontSize: 24,
        textAlign: "center",
        color: Colors.dark.resetButton,
    },
    h2green: {
        fontSize: 24,
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
        marginBottom: 8,
        padding: 4,
        gap: 8,
        marginTop: 0,
    },
    button: {},
    resetButton: {},
    nextButton: {},
    buttonText: {
        color: Colors.dark.text,
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
