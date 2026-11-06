// @ts-nocheck
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
export default function TrainerLayout() { return <Tabs screenOptions={{ headerShown:false, tabBarActiveTintColor:'#111315' }}><Tabs.Screen name="overview" options={{title:'Overview',tabBarIcon:()=> <Text>⌂</Text>}}/><Tabs.Screen name="students" options={{title:'Students',tabBarIcon:()=> <Text>◉</Text>}}/><Tabs.Screen name="messages" options={{title:'Messages',tabBarIcon:()=> <Text>◌</Text>}}/><Tabs.Screen name="profile" options={{title:'Profile',tabBarIcon:()=> <Text>◯</Text>}}/><Tabs.Screen name="availability" options={{href:null}}/></Tabs>; }
