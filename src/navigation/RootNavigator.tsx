import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AppSelectionScreen from '../screens/AppSelectionScreen';

export type RootStackParamList = {
  Home: undefined;
  AppSelection: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'App Blocker' }}
        />
        <Stack.Screen
          name="AppSelection"
          component={AppSelectionScreen}
          options={{ title: 'Select Apps' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
