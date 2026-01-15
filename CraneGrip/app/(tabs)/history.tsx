import React, {useState} from "react";
import {useFocusEffect} from "expo-router";
import {getWorkoutHistory, removeWorkout} from "@/components/AsyncStorage";
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import CustomPicker from "@/components/SortPicker";
import Colors from "@/constants/Colors";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {WorkoutTypes, WorkoutHistoryItem} from "@/types";

type HistoryRow = WorkoutHistoryItem & {
    date: number;
    formattedDate: string;
    formattedTime: string;
};


type SortValue = 'ascending' | 'descending' | 'ascendingM' | 'maxRight' | 'maxLeft' | 'maxBoth';

const OPTIONS: { label: string; value: SortValue }[] = [
    {label: 'Ascending by time', value: 'ascending'},
    {label: 'Descending by time', value: 'descending'},
    {label: 'Ascending by type', value: 'ascendingM'},
    {label: 'By Max right hand', value: 'maxRight'},
    {label: 'By Max left hand', value: 'maxLeft'},
    {label: 'By Max both hands', value: 'maxBoth'},
];

export default function History() {
    const [workoutHistory, setWorkoutHistory] = useState<HistoryRow[]>([]);
    const [sortOrder, setSortOrder] = useState<SortValue>('ascending');

    useFocusEffect(
        React.useCallback(() => {
            getWorkoutHistory().then((value) => {
                const formattedHistory: HistoryRow[] = value.map((workout) => ({
                    ...workout,
                    date: new Date(workout.time).getTime(),
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
    const sortHistory = (order: SortValue) => {
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

    const handleSortChange = (value: SortValue) => {
        setSortOrder(value);
        sortHistory(value);
    };

    const deleteWorkout = (dateString: string) => {
        removeWorkout(dateString).then((updatedHistory) => {
            setWorkoutHistory(updatedHistory);
        });
    };

    // Accent color by workout type
    const getTypeAccent = (type: WorkoutTypes) => {
        switch (type) {
            case WorkoutTypes.Max:
                return Colors.dark.resetButton; // red accent
            case WorkoutTypes.Endurance:
                return Colors.dark.connected; // teal accent
            case WorkoutTypes.HangboardTimer:
                return Colors.dark.confirmButton; // green accent
            default:
                return Colors.dark.selector; // fallback
        }
    };

    const getTypeIcon = (type: WorkoutTypes): keyof typeof MaterialCommunityIcons.glyphMap => {
        switch (type) {
            case WorkoutTypes.Max:
                return 'chart-line';
            case WorkoutTypes.Endurance:
                return 'timer-outline';
            case WorkoutTypes.HangboardTimer:
                return 'timer-sand-complete';
            default:
                return 'circle';
        }
    };

    // History item renderer
    const renderItem = ({item, index}: { item: HistoryRow; index: number }) => (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: index % 2 === 0 ? Colors.dark.card : Colors.dark.selected,
                    borderLeftColor: getTypeAccent(item.type),
                },
            ]}
        >
            <View style={styles.iconContainer}>
                {item.type === WorkoutTypes.Max ? (
                    <MaterialCommunityIcons name="chart-line" size={40} color="white"/>
                ) : item.type === WorkoutTypes.Endurance ? (
                    <MaterialCommunityIcons name="timer-outline" size={40} color="white"/>
                ) : item.type === WorkoutTypes.HangboardTimer ? (
                    <MaterialCommunityIcons name="timer-sand-complete" size={40} color="white"/>
                ) : null}
            </View>
            <View style={styles.itemContent}>
                {item.type === WorkoutTypes.HangboardTimer ? (
                        <>
                            <View style={[styles.typeChip, { backgroundColor: getTypeAccent(item.type) }]}>
                                <MaterialCommunityIcons name={getTypeIcon(item.type)} size={14} color="white" style={styles.typeChipIcon} />
                                <Text style={styles.typeChipText}>{item.type}</Text>
                            </View>
                            <Text style={styles.date}>{item.formattedDate}</Text>
                            <Text style={styles.textSecondary}>Sets: {item.sets}</Text>
                            <Text style={styles.textSecondary}>Repetitions: {item.repetitions}</Text>
                            <Text style={styles.textSecondary}>Hang time: {item.hangTime} s</Text>
                            <Text style={styles.textSecondary}>Rest time between sets: {item.restTime} s</Text>
                            <Text style={styles.textSecondary}>Pause time between reps: {item.pauseTime} </Text>
                        </>
                    ) :
                    <>
                        <View style={[styles.typeChip, { backgroundColor: getTypeAccent(item.type) }]}>
                            <MaterialCommunityIcons name={getTypeIcon(item.type)} size={14} color="white" style={styles.typeChipIcon} />
                            <Text style={styles.typeChipText}>{item.type}</Text>
                        </View>
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
    );

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
                contentContainerStyle={{ paddingVertical: 8 }}
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
        marginVertical: 6,
        borderRadius: 10,
        borderLeftWidth: 4,
    },
    iconContainer: {
        width: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: Colors.dark.background,
    },
    itemContent: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: 'transparent',
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
    typeChip: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        marginBottom: 6,
    },
    typeChipIcon: {
        marginRight: 6,
    },
    typeChipText: {
        color: Colors.dark.text,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
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
