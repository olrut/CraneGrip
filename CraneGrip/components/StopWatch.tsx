import {useEffect, useRef, useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import Colors from "@/constants/Colors";


const formatTime = (milliseconds) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);

    minutes = minutes % 60;
    seconds = seconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
};

export const StopWatch = ({ isRunning, save }) => {
    const [time, setTime] = useState(0);
    const interval = useRef(null);

    useEffect(() => {
        if (isRunning) {
            const startTime = Date.now() - time;
            interval.current = setInterval(() => {
                setTime(Date.now() - startTime);
            }, 10);
            console.log("interval started");
        } else if (time > 0) {
            clearInterval(interval.current);
            save(time);
            setTime(0);
            console.log("interval stopped");
        }
        return () => clearInterval(interval.current);
    }, [isRunning]);

    return (
        <View style={styles.container}>
            <Text style={styles.timer}>{formatTime(time)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
    },
    timer: {
        fontSize: 90,
        fontWeight: "bold",
        color: Colors.dark.text,
    },
});

export default StopWatch;