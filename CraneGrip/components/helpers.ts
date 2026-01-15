import {Linking, Alert} from "react-native";
import { Buffer } from 'buffer';

/**
 * Convert a base64 string to a hex string
 * @param base64 - The base64 string to convert
 */
const base64ToHex = (base64: string): string => Buffer.from(base64, 'base64').toString('hex');


/**
 * Parse the weight data from the manufacturer data of a WH-C06 scale
 * @param manufacturerData
 */
const parseWeightData = (manufacturerData: string | null): number => {

    if (!manufacturerData) {
        return 0;
    }

    try {
        const hexData = base64ToHex(manufacturerData);
        const weightHex = hexData.substring(24, 28);
        return parseInt(weightHex, 16) / 10;
    } catch (error) {
        console.error('Weight parsing error:', error);
        return 0;
    }
};


/**
 * Open a URL in the default browser
 * @param url URL to open
 */
const handleUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
        await Linking.openURL(url);
    } else {
        Alert.alert("Cannot open URL", url);
    }
}
export {base64ToHex, parseWeightData, handleUrl};
