import type React from "react";

export interface Hold {
    name: string;
    depth: string;
}

export enum WorkoutTypes {
    Max = "Max",
    Endurance = "Endurance",
    HangboardTimer = "Hangboard timer",
}

export interface AppSettings {
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

export interface SettingsProviderProps {
    children: React.ReactNode;
}
export type Hands = "separate" | "both";

export interface BaseWorkoutResults {
    time: string;
    type: WorkoutTypes;
    hand: Hands;
}

export interface WorkoutResults extends BaseWorkoutResults {
    left: number;
    right: number;
    both: number;
    hold: Hold;
}

export interface HangTimerResults extends BaseWorkoutResults {
    hangTime: number;
    restTime: number;
    pauseTime: number;
    repetitions: number;
    sets: number;
}

export type WorkoutHistoryItem = WorkoutResults | HangTimerResults;

export interface ConnectionStatusBarProps {
    isConnected: boolean;
    error?: string;
}

export interface HoldsModalProps {
    onClose: () => void;
    onSave: (hold: Hold) => void;
}

export interface MeasureProps {
    save: boolean;
    finishWorkout: (save: boolean, results: WorkoutHistoryItem) => void;
}
