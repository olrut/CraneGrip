import React from "react";

interface Hold {
    name: string;
    depth: string;
}

interface AppSettings {
    activeHold: Hold | null;
    holds: Hold[];
    weighThreshold: number;
    beep: boolean;
}

interface SettingsProviderProps {
    children: React.ReactNode;
}

interface WorkoutResults {
    left: number;
    right: number;
    both: number;
    time: string;
    date: Date;
    hold: Hold;
}

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