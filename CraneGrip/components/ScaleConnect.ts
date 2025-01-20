import {BleManager} from "react-native-ble-plx";
import {parseWeightData} from "@/components/helpers";
import BluetoothPermissions from "@/components/bluetoothPermissions";

const SCALE_NAME = "IF_B7";
const bleManager = new BleManager();

const {
    requestPermissions,
} = BluetoothPermissions();


export const scanForScale = async (setNewWeight, setError) => {
    const isPermissionsEnabled = await requestPermissions();
    if (!isPermissionsEnabled) {
        setError('Permissions not granted');
        return;
    }

    const state = await bleManager.state();
    if (state !== 'PoweredOn') {
        setError('Bluetooth is not enabled');
        const subscription = bleManager.onStateChange((newState) => {
            if (newState === 'PoweredOn') {
                startScan(setNewWeight, setError);
                setError(null);
                subscription.remove();
            }
        }, true);
        return;
    }

    startScan(setNewWeight, setError);
};

const startScan = async (setNewWeight, setError) => {
    try {
        await bleManager.startDeviceScan(
            null,
            { allowDuplicates: true },
            (error, device) => {
                if (error) {
                    console.log(JSON.stringify(error));
                    setError('Failed to scan for devices');
                    return;
                }

                if (device && (device.localName === SCALE_NAME || device.name === SCALE_NAME)) {
                    // Check if the device is the scale and parse the weight
                    setNewWeight(parseWeightData(device.manufacturerData));
                }
            }
        );
    } catch (err) {
        setError('An error occurred while scanning');
        console.error(err);
    }
};

export const stopScan = () => {
    bleManager.stopDeviceScan();
}
