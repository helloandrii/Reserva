import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function BusinessProfileScreen() {
  const C = useThemeColors();
  const { profile, signOut } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <Text style={[styles.header, { color: C.text }]}>Profile</Text>
      
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: C.surface }]}>
            <Ionicons name="business" size={40} color={C.textSecondary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: C.text }]}>{profile?.displayName || 'Business Name'}</Text>
            <Text style={[styles.email, { color: C.textSecondary }]}>{profile?.email}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.signOutButton, { borderColor: C.border }]} 
          onPress={signOut}
        >
          <Text style={[styles.signOutText, { color: Colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: Typography.size.title,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: Typography.size.body,
  },
  signOutButton: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
  }
});
