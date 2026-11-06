import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { hydrateSession } from '../src/api';
import { PhoneSimulator } from '../src/PhoneSimulator';

export default function Layout() {
  const [ready, setReady] = useState(false);
  useEffect(() => { hydrateSession().finally(() => setReady(true)); }, []);
  return <><StatusBar style="dark" />{ready ? <PhoneSimulator><Stack screenOptions={{ headerShown: false }} /></PhoneSimulator> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505' }}><ActivityIndicator color="#fff" /></View>}</>;
}
