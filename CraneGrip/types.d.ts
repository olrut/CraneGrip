import React from "react";

interface Hold {
    name: string;
    depth: string;
}

export enum WorkoutTypes {
    Max = "Max",
    Endurance = "Endurance",
    HangboardTimer = "Hangboard timer",
}

interface AppSettings {
    activeHold: Hold;
    holds: Hold[];
    weighThreshold: number;
    beep: boolean;
    enduranceHands: boolean; // Both if true, otherwise left and right
    hangTimerHands: boolean; // Both if true, otherwise left and right
    preparationTime: number;
    hangTime: number;
    pauseTime: number;
    repetitions: number;
    restTime: number;
    sets: number;
}

interface SettingsProviderProps {
    children: React.ReactNode;
}
type Hands = "separate" | "both";

interface BaseWorkoutResults {
    time: string;
    type: WorkoutTypes;
    hand: Hands;
}

interface WorkoutResults extends BaseWorkoutResults {
    left: number;
    right: number;
    both: number;
    hold: Hold;
}

interface HangTimerResults extends BaseWorkoutResults {
    hangTime: number;
    restTime: number;
    pauseTime: number;
    repetitions: number;
    sets: number;
}

type WorkoutHistoryItem = WorkoutResults | HangTimerResults;

interface ConnectionStatusBarProps {
    isConnected: boolean;
    error?: string;
}

interface HoldsModalProps {
    onClose: () => void;
    onSave: (hold: Hold) => void;
}

interface MeasureProps {
    save: boolean;
    finishWorkout: (save: boolean, results: WorkoutResults) => void;
}


