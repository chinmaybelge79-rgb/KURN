// @ts-nocheck
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
export default function GymLayout() { return <Tabs screenOptions={{ headerShown:false, tabBarActiveTintColor:'#111315' }}><Tabs.Screen name="overview" options={{title:'Overview',tabBarIcon:()=> <Text>⌂</Text>}}/><Tabs.Screen name="members" options={{title:'Members',tabBarIcon:()=> <Text>◉</Text>}}/><Tabs.Screen name="messages" options={{title:'Messages',tabBarIcon:()=> <Text>◌</Text>}}/><Tabs.Screen name="profile" options={{title:'Profile',tabBarIcon:()=> <Text>◯</Text>}}/></Tabs>; }
