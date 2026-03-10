import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function BusinessServicesScreen() {
  const C = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <Text style={[styles.header, { color: C.text }]}>Services</Text>
      
      <View style={[styles.emptyState, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Text style={[styles.emptyText, { color: C.textSecondary }]}>No services added yet</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  header: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xl,
  },
  emptyState: {
    padding: Spacing['2xl'],
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.size.body,
  }
});
