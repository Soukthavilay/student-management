import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Colors } from '../constants/theme';

import TimetableScreen from '../screens/TimetableScreen';
import ExamsScreen from '../screens/ExamsScreen';
import GradesScreen from '../screens/GradesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Timetable: { focused: 'calendar', unfocused: 'calendar-outline' },
  Exams: { focused: 'document-text', unfocused: 'document-text-outline' },
  Grades: { focused: 'school', unfocused: 'school-outline' },
  Notifications: {
    focused: 'notifications',
    unfocused: 'notifications-outline',
  },
  Profile: { focused: 'person-circle', unfocused: 'person-circle-outline' },
};

export default function MainTabs() {
  const { isDark } = useAuth();
  usePushNotifications();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 0.5,
          paddingBottom: 4,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Timetable"
        component={TimetableScreen}
        options={{ tabBarLabel: 'Lịch học' }}
      />
      <Tab.Screen
        name="Exams"
        component={ExamsScreen}
        options={{ tabBarLabel: 'Lịch thi' }}
      />
      <Tab.Screen
        name="Grades"
        component={GradesScreen}
        options={{ tabBarLabel: 'Điểm' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Thông báo' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
}
