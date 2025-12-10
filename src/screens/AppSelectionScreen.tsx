import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useBrick } from '../state/BrickContext';
import {
  openScreenTimePicker,
  requestScreenTimeAuthorization,
  ScreenTimeAuthorizationStatus,
} from '../platform/ios/ScreenTimeService';

type Props = NativeStackScreenProps<RootStackParamList, 'AppSelection'>;

const AppSelectionScreen: React.FC<Props> = () => {
  const { iosSelectionData, setIosSelectionData, status } = useBrick();
  const [authStatus, setAuthStatus] = useState<ScreenTimeAuthorizationStatus>('unknown');
  const [loading, setLoading] = useState(false);

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>App Selection (Android)</Text>
        <Text>
          Android app selection and blocking will be implemented using Accessibility Service in a
          later step.
        </Text>
      </View>
    );
  }

  const handleRequestAuthorization = async () => {
    try {
      setLoading(true);
      const statusResult = await requestScreenTimeAuthorization();
      setAuthStatus(statusResult);
      if (statusResult !== 'approved') {
        Alert.alert(
          'Screen Time not approved',
          'Go to Settings → Screen Time → App Limits / Content & Privacy to ensure this app is allowed to manage Screen Time.',
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to request Screen Time authorization.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPicker = async () => {
    try {
      setLoading(true);
      const selectionBase64 = await openScreenTimePicker();
      if (!selectionBase64) {
        return;
      }
      setIosSelectionData(selectionBase64);
      Alert.alert('Selection saved', 'Your Screen Time selection has been stored locally.');
    } catch {
      Alert.alert('Error', 'Failed to open Screen Time picker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iOS Screen Time Setup</Text>
      <Text style={styles.paragraph}>
        This screen configures which apps iOS Screen Time should block when the Brick state is
        enabled.
      </Text>

      <Text style={styles.label}>Current Screen Time authorization:</Text>
      <Text style={styles.value}>{authStatus}</Text>

      <View style={styles.buttonRow}>
        <Button
          title={loading ? 'Requesting…' : 'Request Screen Time Authorization'}
          onPress={handleRequestAuthorization}
          disabled={loading}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title={loading ? 'Opening picker…' : 'Choose Apps to Block'}
          onPress={handleOpenPicker}
          disabled={loading}
        />
      </View>

      <Text style={styles.label}>Stored iOS selection:</Text>
      <Text style={styles.value}>{iosSelectionData ? 'Configured' : 'Not configured yet'}</Text>

      <Text style={styles.label}>Current brick state:</Text>
      <Text style={styles.value}>{status}</Text>

      <Text style={styles.paragraphSmall}>
        When you toggle Brick on the Home screen, the app will ask iOS to apply or remove Screen
        Time shields based on your selected apps.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 16,
  },
  paragraphSmall: {
    fontSize: 12,
    marginTop: 16,
    color: '#555',
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
  buttonRow: {
    marginTop: 16,
  },
});

export default AppSelectionScreen;
