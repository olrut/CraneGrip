import React, {useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Slider} from '@miblanchard/react-native-slider';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {removeItem} from "@/components/AsyncStorage";
import ConfirmDialog from "@/components/ConfirmDialog";
import HoldsModal from "@/components/HoldsModal";
import HoldsPicker from "@/components/HoldsPicker";
import {useSettings} from "@/components/SettingContext";
import {Hold} from "@/types";
import {handleUrl} from "@/components/helpers";
import Colors from "@/constants/Colors";

const MAX_THRESHOLD = 250;
const MIN_THRESHOLD = 1;

export default function Settings() {
    const [confirmClear, setConfirmClear] = useState(false);
    const [holdsModalVisible, setHoldsModalVisible] = useState(false);
    const {settings, updateSettings} = useSettings();

    const clearHistory = () => {
        removeItem("workouts").then(r => {
                setConfirmClear(false);
            }
        )
    };

    const cancelClear = () => {
        setConfirmClear(false);
    }

    const saveHold = async (newHold: Hold) => {
        updateSettings({
            holds: settings.holds
                ? settings.holds.some((hold: Hold) => hold.name === newHold.name) // Check if hold already exists
                    ? settings.holds // If exists, return the list as is
                    : [...settings.holds, newHold] // If not, add the new hold to the list
                : [newHold], // If no holds exist, create a new list with the new hold
        });
    }

    /**
     * Update the threshold in the settings if it is within the allowed range
     * @param threshold
     */
    const updateThreshold = (threshold: number) => {
        updateSettings({weighThreshold: threshold});
    }

    /**
     * Update the active hold in the settings
     * @param activeHold
     */
    const handleHoldChange = (activeHold: Hold) => {
        updateSettings({activeHold});
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#121212'}}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.section, {paddingTop: 4}]}>
                    <Text style={styles.sectionTitle}>Holds</Text>
                    <HoldsPicker onValueChange={handleHoldChange}
                                 setHoldsModalVisible={setHoldsModalVisible}></HoldsPicker>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Endurance config</Text>
                    <View style={styles.sectionBody}>
                        <View style={[styles.rowWrapper, styles.rowFirst]}>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Weight threshold (1-250 kg)</Text>
                                <View style={styles.rowSpacer}/>
                                <Text style={styles.rowValue}>{settings.weighThreshold}</Text>
                            </View>
                            <View style={styles.slider}>
                                <Slider
                                    step={1}
                                    maximumValue={MAX_THRESHOLD}
                                    minimumValue={MIN_THRESHOLD}
                                    value={settings.weighThreshold}
                                    onValueChange={value => updateThreshold(value)}
                                />
                            </View>
                        </View>
                        <View style={[styles.rowWrapper]}>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Both hands</Text>
                                <View style={styles.rowSpacer}/>
                                <Switch
                                    onValueChange={enduranceHands =>
                                        updateSettings({enduranceHands: enduranceHands})
                                    }
                                    style={{transform: [{scaleX: 0.95}, {scaleY: 0.95}]}}
                                    value={settings.enduranceHands}/>
                            </View>
                        </View>
                        <View style={[styles.rowWrapper, styles.rowLast]}>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Beep</Text>
                                <View style={styles.rowSpacer}/>
                                <Switch
                                    onValueChange={beep =>
                                        updateSettings({beep: beep})
                                    }
                                    style={{transform: [{scaleX: 0.95}, {scaleY: 0.95}]}}
                                    value={settings.beep}/>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resources</Text>
                    <View style={styles.sectionBody}>
                        <View style={[styles.rowWrapper, styles.rowLast]}>
                            <TouchableOpacity
                                onPress={() => {
                                    handleUrl("https://www.github.com/olrut/cranegrip");
                                }}
                                style={styles.row}>
                                <Text style={styles.rowLabel}>Contact Us</Text>
                                <View style={styles.rowSpacer}/>
                                <FeatherIcon
                                    color="#bcbcbc"
                                    name="chevron-right"
                                    size={19}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionBody}>
                        <View
                            style={[
                                styles.rowFirst,
                                styles.rowLast,
                                {alignItems: 'center'},
                            ]}>
                            <TouchableOpacity
                                onPress={() => {
                                    setConfirmClear(true);
                                }}
                                style={styles.row}>
                                <Text style={[styles.rowLabel, styles.rowLabelLogout]}>
                                    Clear Training History
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <Text style={styles.contentFooter}>App Version 0.1.0</Text>
            </ScrollView>
            {confirmClear &&
                <ConfirmDialog message={"Are you sure you want to clear workout history?"} onConfirm={clearHistory}
                               onCancel={cancelClear}></ConfirmDialog>}

            {holdsModalVisible &&
                <HoldsModal onSave={saveHold}
                            onClose={() => setHoldsModalVisible(false)}
                ></HoldsModal>
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    /** Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
    },
    headerAction: {
        width: 40,
        height: 40,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 19,
        fontWeight: '600',
        color: Colors.dark.text,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        textAlign: 'center',
    },
    /** Content */
    content: {
        paddingHorizontal: 16,
    },
    contentFooter: {
        marginTop: 24,
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        color: Colors.dark.selector,
    },
    /** Section */
    section: {
        paddingVertical: 12,
        marginBottom: 0,
    },
    sectionTitle: {
        margin: 8,
        marginLeft: 12,
        fontSize: 13,
        letterSpacing: 0.33,
        fontWeight: '500',
        color: Colors.dark.selector,
        textTransform: 'uppercase',
    },
    sectionBody: {
        borderRadius: 12,
        backgroundColor: Colors.dark.card,
    },
    /** Row */
    row: {
        height: 44,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingRight: 12,
    },
    rowWrapper: {
        paddingLeft: 16,
        backgroundColor: Colors.dark.card,
        borderTopWidth: 0, // Remove top border to prevent separators at the beginning
        borderColor: Colors.dark.button,
        borderBottomWidth: 1, // Add separator to all rows except the last one
    },
    rowFirst: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    rowLabel: {
        fontSize: 16,
        letterSpacing: 0.24,
        color: Colors.dark.text,
    },
    rowSpacer: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
    },
    rowValue: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.dark.button,
        marginRight: 4,
    },
    rowLast: {
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderBottomWidth: 0, // Remove bottom border for the last row
    },
    rowLabelLogout: {
        width: '100%',
        textAlign: 'center',
        fontWeight: '600',
        color: Colors.dark.resetButton,
    },
    /** Input */
    input: {
        height: 44,
        width: 80,
        fontSize: 16,
        fontWeight: '500',
        color: Colors.dark.text,
        textAlign: 'right',
    },

    /** Slider */
    slider: {
        flex: 1,
        paddingRight: 16,
        paddingBottom: 12,
    },
});