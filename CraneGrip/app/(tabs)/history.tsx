import React, {useState} from "react";
import {useFocusEffect} from "expo-router";
import {getWorkoutHistory, removeWorkout} from "@/components/AsyncStorage";
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import CustomPicker from "@/components/SortPicker";
import Colors from "@/constants/Colors";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {WorkoutTypes} from "@/enumTypes";




const OPTIONS = [
    {label: 'Ascending by time', value: 'ascending'},
    {label: 'Descending by time', value: 'descending'},
    {label: 'Ascending by type', value: 'ascendingM'},
    {label: 'By Max right hand', value: 'maxRight'},
    {label: 'By Max left hand', value: 'maxLeft'},
    {label: 'By Max both hands', value: 'maxBoth'},
];

export default function History() {
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [sortOrder, setSortOrder] = useState<'ascending' | 'descending'>('ascending');

    useFocusEffect(
        React.useCallback(() => {
            getWorkoutHistory().then((value) => {
                const formattedHistory = value.map((workout) => ({
                    ...workout,
                    date: new Date(workout.time),
                    // TODO: Localize date and time
                    formattedDate: new Date(workout.time).toLocaleDateString("fi-FI", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    }),
                    formattedTime: new Date(workout.time).toLocaleTimeString("fi-FI", {
                        hour: "2-digit",
                        minute: "2-digit"
                    })
                }));
                formattedHistory.sort((a, b) => b.date - a.date);
                setWorkoutHistory(formattedHistory);
            });
            return () => {
            };
        }, [])
    );


    /**
     * Sorts the workout history based on the selected order
     * @param order
     */
    const sortHistory = (order) => {
        const sortedHistory = [...workoutHistory].sort((a, b) => {
            if (order === 'ascendingM') {
                return a.type.localeCompare(b.type);
            }
            if (order === 'maxRight') {
                return b.right - a.right;
            }
            if (order === 'maxLeft') {
                return b.left - a.left;
            }
            if (order === 'maxBoth') {
                return b.both - a.both;
            }
            return order === 'ascending' ? a.date - b.date : b.date - a.date;
        });
        setWorkoutHistory(sortedHistory);
    };

    const handleSortChange = (value: 'ascending' | 'descending') => {
        setSortOrder(value);
        sortHistory(value);
    };

    const deleteWorkout = (dateString: String) => {
        removeWorkout(dateString).then((updatedHistory) => {
            setWorkoutHistory(updatedHistory);
        });
    };

// History item renderer
    const renderItem = ({item}) => (
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    {item.type === WorkoutTypes.Max ? (
                        <MaterialCommunityIcons name="chart-line" size={40} color="white"/>
                    ) : item.type === "Endurance" ? (
                        <MaterialCommunityIcons name="timer-outline" size={40} color="white"/>
                    ) : item.type === WorkoutTypes.HangboardTimer  ? (
                        <MaterialCommunityIcons name="timer-sand-complete" size={40} color="white"/>
                    ) : null}
                </View>


                <View style={styles.contentContainer}>
                    {item.type === WorkoutTypes.HangboardTimer ? (
                        <>
                            <Text style={styles.type}>{item.type}</Text>
                            <Text style={styles.date}>{item.formattedDate}</Text>
                            <Text style={styles.textSecondary}>Sets: {item.sets}</Text>
                            <Text style={styles.textSecondary}>Repetitions: {item.repetitions}</Text>
                            <Text style={styles.textSecondary}>Hang time: {item.hangTime} s</Text>
                            <Text style={styles.textSecondary}>Rest time between sets: {item.restTime} s</Text>
                            <Text style={styles.textSecondary}>Pause time between reps: {item.pauseTime} </Text>
                        </>
                    ) :
                        <>
                            <Text style={styles.type}>{item.type}</Text>
                            <Text style={styles.date}>{item.formattedDate}</Text>
                            {item.both ? <Text style={styles.textSecondary}>Both hands: {item.both} kg </Text> : null}
                            {item.left ? <Text style={styles.textSecondary}>Left hand: {item.left} kg</Text> : null}
                            {item.right ? <Text style={styles.textSecondary}>Right hand: {item.right} kg</Text> : null}
                        </>
                    }
                </View>


                <TouchableOpacity
                    onPress={() => deleteWorkout(item.time)}
                    style={styles.deleteButton}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        )
    ;


    return (
        <View style={styles.contentContainer}>
            <CustomPicker
                title="Sort by:"
                selectedValue={sortOrder}
                options={OPTIONS}
                onValueChange={(value) => handleSortChange(value as 'ascending' | 'descending')}
            />
            <FlatList
                data={workoutHistory}
                renderItem={renderItem}
                keyExtractor={item => item.time}
                ListEmptyComponent={() => <Text style={styles.textSecondary}>No history</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.dark.card,
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
    },
    iconContainer: {
        width: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    deleteButton: {
        backgroundColor: Colors.dark.resetButton,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: Colors.dark.text,
        fontWeight: "bold",
    },
    type: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.dark.text,
    },
    mode: {
        fontSize: 14,
        color: Colors.dark.text,
    },
    date: {
        fontSize: 12,
        color: Colors.dark.text,
    },
    textSecondary: {
        fontSize: 12,
        color: Colors.dark.text,
    },
});