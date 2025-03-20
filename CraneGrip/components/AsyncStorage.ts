import AsyncStorage from '@react-native-async-storage/async-storage';
import {WorkoutHistoryItem, WorkoutResults} from "@/types";

export const getItem = async (key: string) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value != null ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Error getting item:', error);
        return null;
    }
};

export const saveWorkout = async (value: WorkoutHistoryItem) => {
    try {
        const existingHistory = await getItem('workouts') || [];
        const updatedHistory = [...existingHistory, value];
        await AsyncStorage.setItem('workouts', JSON.stringify(updatedHistory));
    } catch (error) {
        console.error('Error saving workout to history:', error);
    }
};

/**
 * Returns the workout history from AsyncStorage
 *
 */
export const getWorkoutHistory = async () : Promise<WorkoutResults[]> => {
    try {
        const history = await getItem('workouts');
        return history || [];
    } catch (error) {
        console.error('Error getting workout history:', error);
        return [];
    }
};

/**
 * Removes an item from AsyncStorage such as a workouts or settings
 * setting
 * @param key
 */
export const removeItem = async (key: string) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing item:', error);
    }
};

/**
 * Removes a workout from the history, by getting the current history, filtering out the workout with the given id,
 * and saving the updated history
 * @param dateString Timestamp of the workout to remove
 * @returns Updated workout history
 */
export const removeWorkout = async (dateString: string)  => {
    try {
        const existingHistory = await getItem('workouts') || [];
        const updatedHistory = existingHistory.filter((workout: WorkoutHistoryItem) => workout.time !== dateString);
        await AsyncStorage.setItem('workouts', JSON.stringify(updatedHistory));
        return updatedHistory;
    } catch (error) {
        console.error('Error removing workout:', error);
    }
}