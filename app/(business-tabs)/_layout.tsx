import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function BusinessTabLayout() {
  const colorScheme = useColorScheme();

  return (
    <NativeTabs
      tintColor={Colors[colorScheme ?? 'light'].tint}
      backgroundColor={Colors[colorScheme ?? 'light'].background}
      shadowColor={colorScheme === 'dark' ? '#333' : '#ccc'}
    >
      <NativeTabs.Trigger name="index">
        <Label>Dashboard</Label>
        <Icon sf="chart.bar" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="bookings">
        <Label>Bookings</Label>
        <Icon sf="calendar.badge.clock" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="services">
        <Label>Services</Label>
        <Icon sf="scissors" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon sf="person.crop.circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
