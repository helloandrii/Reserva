import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function BusinessDashboardScreen() {
  const C = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <Text style={[styles.header, { color: C.text }]}>Dashboard</Text>
      
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Today's Bookings</Text>
          <Text style={[styles.cardValue, { color: C.text }]}>0</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>This Week</Text>
          <Text style={[styles.cardValue, { color: C.text }]}>12</Text>
        </View>
      </View>

      <View style={[styles.fullCard, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Text style={[styles.cardTitle, { color: C.text }]}>Next Upcoming</Text>
        <Text style={[styles.cardSubtitle, { color: C.textSecondary }]}>No upcoming bookings</Text>
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
  grid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  card: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  fullCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
  cardValue: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.bold,
  },
  cardSubtitle: {
    fontSize: Typography.size.body,
  }
});
