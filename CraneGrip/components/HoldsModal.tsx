import React, {useState} from 'react';
import {Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Hold, HoldsModalProps} from "@/types";
import Colors from "@/constants/Colors";

const HoldsModal: React.FC<HoldsModalProps> = ({onClose, onSave})  => {
    const [holdName, setHoldName] = useState('');
    const [holdDepth, setHoldDepth] = useState('');

    const handleSave = () => {
        if (!holdName.trim() || !holdDepth.trim()) {
            alert('Please fill in both fields before saving.');
            return;
        }

        const holdData : Hold = {
            name: holdName,
            depth: holdDepth,
        };
        onSave(holdData);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setHoldName('');
        setHoldDepth('');
    };

    return (
        <Modal>
            <View style={styles.modalContainer}>
                <Text style={styles.title}>Add a New Hold</Text>
                <TextInput
                    style={styles.input}
                    autoFocus={true}
                    placeholder="Enter hold name"
                    maxLength={20}
                    value={holdName}
                    onChangeText={setHoldName}
                    placeholderTextColor="#bbb"
                />
                <TextInput
                    style={styles.input}
                    maxLength={3}
                    placeholder="Enter hold depth or diameter (mm)"
                    value={holdDepth}
                    onChangeText={setHoldDepth}
                    keyboardType="numeric"
                    placeholderTextColor="#bbb"
                />
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: Colors.dark.card,
        padding: 20,
    },
    buttonText: {
        color: Colors.dark.text,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: Colors.dark.confirmButton,
        paddingRight: 40,
        padding: 20,
        paddingLeft: 40,
        borderRadius: 10,
    },
    cancelButton: {
        backgroundColor: Colors.dark.resetButton,
        padding: 20,
        paddingRight: 40,
        paddingLeft: 40,
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.dark.text,
    },
    input: {
        height: 50,
        borderColor: Colors.dark.connected,
        borderWidth: 1,
        marginBottom: 10,
        borderRadius: 10,
        paddingLeft: 10,
        color: Colors.dark.text,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
});

export default HoldsModal;