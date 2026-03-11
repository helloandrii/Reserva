import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/utils/supabase';

interface DashboardStats {
  todayCount: number;
  weekCount: number;
  nextBooking: any | null;
}

export default function BusinessDashboardScreen() {
  const C = useThemeColors();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    todayCount: 0,
    weekCount: 0,
    nextBooking: null,
  });

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { count: todayCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', user.id)
        .gte('booking_date', startOfDay.toISOString())
        .lt('booking_date', endOfDay.toISOString());

      const { count: weekCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', user.id)
        .gte('booking_date', startOfWeek.toISOString())
        .lt('booking_date', endOfWeek.toISOString());

      const { data: nextData } = await supabase
        .from('bookings')
        .select('*, services(name)')
        .eq('business_id', user.id)
        .gte('booking_date', now.toISOString())
        .order('booking_date', { ascending: true })
        .limit(1)
        .single();

      setStats({
        todayCount: todayCount || 0,
        weekCount: weekCount || 0,
        nextBooking: nextData || null,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
      setLoading(true);
      fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await fetchStats();
      setRefreshing(false);
  }, [fetchStats]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <Text style={[styles.header, { color: C.text }]}>Dashboard</Text>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={C.text} />
        </View>
      ) : (
        <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.text} />
            }
        >
          <View style={styles.grid}>
            <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.cardTitle, { color: C.text }]}>Today's Bookings</Text>
              <Text style={[styles.cardValue, { color: C.text }]}>{stats.todayCount}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.cardTitle, { color: C.text }]}>This Week</Text>
              <Text style={[styles.cardValue, { color: C.text }]}>{stats.weekCount}</Text>
            </View>
          </View>

          <View style={[styles.fullCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Next Upcoming</Text>
            {stats.nextBooking ? (
              <View style={{ marginTop: Spacing.sm }}>
                <Text style={{ color: C.text, fontWeight: '600', fontSize: Typography.size.md }}>
                  {stats.nextBooking.services?.name || 'Unknown Service'}
                </Text>
                <Text style={{ color: C.textSecondary, marginTop: 4 }}>
                  {new Date(stats.nextBooking.booking_date).toLocaleString()}
                </Text>
              </View>
            ) : (
              <Text style={[styles.cardSubtitle, { color: C.textSecondary }]}>No upcoming bookings</Text>
            )}
          </View>
        </ScrollView>
      )}
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
