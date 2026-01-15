import React, {useEffect, useRef, useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import {useSettings} from "@/components/SettingContext";
import Colors from "@/constants/Colors";
import {RestScreen} from "@/components/RestScreen";
import {TimerCurtain} from "@/components/TimerCurtain";
import {WorkoutTypes, WorkoutHistoryItem} from "@/types";
import { playBeep } from "@/components/sound";
import * as Haptics from 'expo-haptics';

type HangTimerProps = { finishWorkout: (save: boolean, results: WorkoutHistoryItem) => void };

function HangTimer({finishWorkout}: HangTimerProps) {
    const {settings} = useSettings();
    const totalSets = useRef(settings.sets);
    const totalRepetitions = useRef(settings.repetitions);
    const [currentSet, setCurrentSet] = useState(1);
    const [currentRepetition, setCurrentRepetition] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [isWorking, setIsWorking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isPreparation, setIsPreparation] = useState(true);
    const [prepareSeconds, setPrepareSeconds] = useState(settings.preparationTime);
    const [restKey, setRestKey] = useState(0);

    useEffect(() => {
        let timer;
        if (isResting) {
            if (currentSet >= totalSets.current) {
                finish();
            } else {
                timer = setTimeout(() => {
                    setIsResting(false);
                    setCurrentRepetition(1);
                    if (settings.beep) { try { playBeep(); } catch {} }
                    setIsWorking(true);
                }, settings.restTime * 1000);
            }
        } else if (isPaused) {
            timer = setTimeout(() => {
                setIsPaused(false);
                if (settings.beep) { try { playBeep(); } catch {} }
                setIsWorking(true);
            }, settings.pauseTime * 1000);
        } else if (isWorking) {
            timer = setTimeout(() => {
                if (currentRepetition < totalRepetitions.current) {
                    setIsWorking(false);
                    if (settings.beep) { try { playBeep(); } catch {} }
                    setIsPaused(true);
                    setCurrentRepetition((prev) => prev + 1);
                } else if (currentSet < totalSets.current) {
                    setIsWorking(false);
                    if (settings.beep) { try { playBeep(); } catch {} }
                    setIsResting(true);
                    setCurrentSet((prev) => prev + 1);
                } else {
                    finish();
                }
            }, settings.hangTime * 1000);
        } else if (isPreparation) {
            timer = setTimeout(() => {
                setIsPreparation(false);
                if (settings.beep) { try { playBeep(); } catch {} }
                setIsWorking(true);
            }, prepareSeconds * 1000);
        }
        return () => clearTimeout(timer);
    }, [isResting, isWorking, isPaused, isPreparation, prepareSeconds, currentSet, currentRepetition]);

    const finish = () => {
        const workoutResults: WorkoutHistoryItem = {
            time: new Date().toISOString(),
            hangTime: settings.hangTime,
            restTime: settings.restTime,
            pauseTime: settings.pauseTime,
            repetitions: settings.repetitions,
            sets: settings.sets,
            hand: settings.hangTimerHands ? "both" : "separate",
            type: WorkoutTypes.HangboardTimer,
        };
        finishWorkout(true, workoutResults);
    };

    return (
        <View style={styles.container}>
            <View style={styles.info}>
                <Text style={styles.header}>Set {currentSet} / {settings.sets}</Text>
                <Text style={styles.subHeader}>Repetition {currentRepetition} / {settings.repetitions}</Text>
            </View>
            {isPreparation ? (
                <RestScreen
                    message={"Prepare"}
                    restTime={prepareSeconds}
                    key={restKey}
                    isRunning={setIsPreparation}
                    onSkip={() => {
                        // When prepare finishes, start working and beep
                        if (settings.beep) { try { playBeep(); } catch {} }
                        setIsWorking(true);
                    }}
                    showSkipButton={false}
                />
            ) : isResting ? (
                <RestScreen
                    message={"Rest"}
                    restTime={settings.restTime}
                    isRunning={setIsResting}
                    onSkip={() => {
                        // End rest, then give 3s prepare window
                        if (currentSet >= totalSets.current) {
                            finish();
                        } else {
                            setIsResting(false);
                            setCurrentRepetition(1);
                            setPrepareSeconds(3);
                            setRestKey((k) => k + 1);
                            setIsPreparation(true);
                            if (settings.beep) { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {} }
                        }
                    }}
                />
            ) : isPaused ? (
                <RestScreen
                    message={"Pause"}
                    restTime={settings.pauseTime}
                    isRunning={setIsPaused}
                    onSkip={() => {
                        // End pause, then give 3s prepare window
                        setIsPaused(false);
                        setPrepareSeconds(3);
                        setRestKey((k) => k + 1);
                        setIsPreparation(true);
                        if (settings.beep) { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {} }
                    }}
                />
            ) : (
                // If none of the modes are on, show the timer
                <TimerCurtain
                    initialSeconds={isWorking ? settings.hangTime : settings.preparationTime}
                    finished={() => setIsResting(true)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: Colors.dark.connected,
    },
    info: {
        paddingTop: 20,
        alignItems: "center",
        backgroundColor: Colors.dark.selector,
        width: "100%",
    },
    header: {
        fontSize: 40,
        fontWeight: "bold",
        color: Colors.dark.connected,
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 38,
        color: Colors.dark.connected,
        paddingBottom: 20,
    }
});

export default HangTimer;
