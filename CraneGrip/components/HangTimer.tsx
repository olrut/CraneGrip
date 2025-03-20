import React, {useEffect, useRef, useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import {useSettings} from "@/components/SettingContext";
import Colors from "@/constants/Colors";
import {RestScreen} from "@/components/RestScreen";
import {TimerCurtain} from "@/components/TimerCurtain";
import {WorkoutTypes} from "@/enumTypes";
function HangTimer({finishWorkout}) {
    const {settings} = useSettings();
    const totalSets = useRef(settings.sets);
    const totalRepetitions = useRef(settings.repetitions);
    const [currentSet, setCurrentSet] = useState(1);
    const [currentRepetition, setCurrentRepetition] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [isWorking, setIsWorking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isPreparation, setIsPreparation] = useState(true);

    useEffect(() => {
        let timer;
        if (isResting) {
            if (currentSet >= totalSets.current) {
                finish();
            } else {
                timer = setTimeout(() => {
                    setIsResting(false);
                    setCurrentRepetition(1);
                    setIsWorking(true);
                }, settings.restTime * 1000);
            }
        } else if (isPaused) {
            timer = setTimeout(() => {
                setIsPaused(false);
                setIsWorking(true);
            }, settings.pauseTime * 1000);
        } else if (isWorking) {
            timer = setTimeout(() => {
                if (currentRepetition < totalRepetitions.current) {
                    setIsWorking(false);
                    setIsPaused(true);
                    setCurrentRepetition((prev) => prev + 1);
                } else if (currentSet < totalSets.current) {
                    setIsWorking(false);
                    setIsResting(true);
                    setCurrentSet((prev) => prev + 1);
                } else {
                    finish(false);
                }
            }, settings.hangTime * 1000);
        } else if (isPreparation) {
            timer = setTimeout(() => {
                setIsPreparation(false);
                setIsWorking(true);
            }, settings.preparationTime * 1000);
        }
        return () => clearTimeout(timer);
    }, [isResting, isWorking, isPaused, currentSet, currentRepetition]);

    const finish = () => {
        const workoutResults = {
            time: new Date().toISOString(),
            hangTime: settings.hangTime,
            restTime: settings.restTime,
            pauseTime: settings.pauseTime,
            repetitions: settings.repetitions,
            sets: settings.sets,
            hand: settings.hangTimerHands,
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
                <RestScreen message={"Prepare"} restTime={settings.preparationTime} isRunning={setIsPreparation}/>
            ) : isResting ? (
                <RestScreen message={"Rest"} restTime={settings.restTime} isRunning={null}/>
            ) : isPaused ? (
                <RestScreen message={"Pause"} restTime={settings.pauseTime} isRunning={null}/>
            ) : (
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
    },
    info: {
        paddingTop: 20,
        alignItems: "center",
        color: Colors.dark.connected,
        backgroundColor: Colors.dark.button,
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