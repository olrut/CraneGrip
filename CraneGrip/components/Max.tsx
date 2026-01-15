import React, {useRef, useState} from "react";
import ConnectionStatusBar from "@/components/ConnectionStatusBar";
import {useFocusEffect} from "expo-router";
import {StyledView, Text} from "@/components/Themed";
import {Pressable, StyleSheet, View} from "react-native";
import MaxLine from "@/components/MaxLine";
import Colors from "@/constants/Colors";
import {WorkoutHistoryItem} from "@/types";
import {useSettings} from "@/components/SettingContext";
import {scanForScale, stopScan} from "@/components/ScaleConnect";
import { playRaceStart } from "@/components/sound";
import {WorkoutTypes} from "@/types";
import buttonStyles from "@/components/ButtonStyles";


interface MaxProps {
    finishWorkout: (save: boolean, results: WorkoutHistoryItem) => void;
}

export default function Max({finishWorkout}: MaxProps) {
    const Hands = {
        BOTH: "Both hands",
        RIGHT: "Right hand",
        LEFT: "Left hand",
    } as const;

    type HandType = typeof Hands[keyof typeof Hands];
    const [weight, setWeight] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const timeoutRef = useRef(null);
    const [currentHand, setCurrentHand] = useState<HandType>(Hands.BOTH);
    const [currentMax, setCurrentMax] = useState(0);
    const maxLeftRef = useRef(0);
    const maxRightRef = useRef(0);
    const maxBothRef = useRef(0);
    const [error, setError] = useState(null);
    const {settings} = useSettings();

    const updateMax = (weight: number) => {
        setCurrentMax((prev) => (weight > prev ? weight : prev));
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
        switch (currentHand) {
            case Hands.BOTH:
                maxBothRef.current = currentMax;
                break;
            case Hands.RIGHT:
                maxRightRef.current = currentMax;
                break;
            case Hands.LEFT:
                maxLeftRef.current = currentMax;
                break;
        }

        const results: WorkoutHistoryItem = {
            time: new Date().toISOString(),
            type: WorkoutTypes.Max,
            left: maxLeftRef.current,
            right: maxRightRef.current,
            both: maxBothRef.current,
            hold: settings.activeHold,
            hand: "separate",
        };

        finishWorkout(save, results);
    }

    const resetMax = () => {
        setCurrentMax(0);
    };

    // Example: call to play a start sound using expo-av helper
    const playSound = async () => {
        try { await playRaceStart(); } catch {}
    };

    const changeHands = () => {
        setCurrentHand((prevHand) => {
            switch (prevHand) {
                case Hands.BOTH:
                    maxBothRef.current = currentMax;
                    setCurrentMax(maxRightRef.current);
                    return Hands.RIGHT;
                case Hands.RIGHT:
                    maxRightRef.current = currentMax;
                    setCurrentMax(maxLeftRef.current);
                    return Hands.LEFT;
                case Hands.LEFT:
                    maxLeftRef.current = currentMax;
                    setCurrentMax(maxBothRef.current);
                    return Hands.BOTH;
            }
        });
    };

    return (
        <>
            <StyledView style={styles.container}>
                <Text style={styles.header}>{currentHand}</Text>
                <Text style={styles.header}>{settings.activeHold?.name} {settings.activeHold?.depth} mm</Text>
                <View style={styles.cards}>
                    <View style={styles.card}>
                        <Text style={styles.current}>
                            {weight}
                        </Text>
                        <Text style={styles.kg}>
                            Current kg
                        </Text>
                    </View>
                    <View style={styles.card}>

                        <Text style={styles.maxval}>
                            {currentMax}
                        </Text>
                        <Text style={styles.kg}>MAX kg</Text>
                    </View>
                </View>
                <View style={styles.line}>
                    <MaxLine
                        weight={weight}
                        maxWeight={currentMax}/>
                </View>
                <View style={styles.buttons}>
                    <Pressable style={buttonStyles.neutral}
                               onPress={() => changeHands()}>
                        <Text style={styles.buttonText}>Change hand</Text>
                    </Pressable>
                </View>
                <View style={styles.buttons}>
                    <Pressable style={buttonStyles.danger} onPress={() => resetMax()}>
                        <Text style={styles.buttonText}>Reset max</Text>
                    </Pressable>
                    <Pressable style={buttonStyles.danger} onPress={() => finish(false)}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={buttonStyles.primary} onPress={() => finish(true)}>
                        <Text style={styles.buttonText}>Save</Text>
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
        backgroundColor: Colors.dark.background,
    },
    line: {
        flex: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.dark.text,
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
    current: {
        fontSize: 40,
        color: Colors.dark.connected,
    },
    kg: {
        fontSize: 30,
        color: Colors.dark.text,
    },
    maxval: {
        fontSize: 40,
        color: Colors.dark.resetButton,
    },
});
