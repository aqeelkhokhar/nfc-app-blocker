import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useBrick } from '../state/BrickContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { status, toggleBrick, blockedApps, pairedNfcTagId } = useBrick();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NFC App Blocker</Text>

      <Text style={styles.label}>Current state:</Text>
      <Text style={[styles.value, status === 'BRICKED' ? styles.bricked : styles.unbricked]}>
        {status}
      </Text>

      <Text style={styles.label}>Paired NFC tag:</Text>
      <Text style={styles.value}>{pairedNfcTagId ?? 'Not paired yet'}</Text>

      <Text style={styles.label}>Blocked apps:</Text>
      <Text style={styles.value}>
        {blockedApps.length > 0
          ? blockedApps.map(app => app.name).join(', ')
          : 'No apps selected'}
      </Text>

      <View style={styles.buttonRow}>
        <Button
          title={status === 'BRICKED' ? 'Unbrick (Disable Block)' : 'Brick (Enable Block)'}
          onPress={toggleBrick}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Select Apps to Block"
          onPress={() => navigation.navigate('AppSelection')}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Pair NFC Tag (placeholder)"
          onPress={() => {
            // TODO: integrate real NFC pairing via react-native-nfc-manager
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginTop: 12,
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  bricked: {
    color: 'red',
  },
  unbricked: {
    color: 'green',
  },
  buttonRow: {
    marginTop: 16,
  },
});

export default HomeScreen;
