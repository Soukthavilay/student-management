import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import CurriculumScreen from '../screens/CurriculumScreen';
import TuitionScreen from '../screens/TuitionScreen';
import EnrollmentScreen from '../screens/EnrollmentScreen';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Curriculum" component={CurriculumScreen} />
          <Stack.Screen name="Tuition" component={TuitionScreen} />
          <Stack.Screen name="Enrollment" component={EnrollmentScreen} />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animationTypeForReplace: 'pop' }}
        />
      )}
    </Stack.Navigator>
  );
}
