import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <NativeTabs
      tintColor={Colors[colorScheme ?? 'light'].tint}
      backgroundColor={Colors[colorScheme ?? 'light'].background}
      shadowColor={colorScheme === 'dark' ? '#333' : '#ccc'}
    >
      <NativeTabs.Trigger name="index">
        <Label>Map</Label>
        <Icon sf="map" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Label>Search</Label>
        <Icon sf="magnifyingglass" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="bookings">
        <Label>Bookings</Label>
        <Icon sf="calendar.badge.clock" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
