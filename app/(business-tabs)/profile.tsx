import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/utils/supabase';

// Helper for UI
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = typeof DAYS[number];

type WorkingHours = {
  [key in Day]: { open: string; close: string; isClosed: boolean };
};

const DEFAULT_HOURS: WorkingHours = DAYS.reduce((acc, day) => {
  acc[day] = { open: '09:00', close: '17:00', isClosed: day === 'sunday' };
  return acc;
}, {} as WorkingHours);

export default function BusinessProfileScreen() {
  const C = useThemeColors();
  const { profile, signOut } = useAuth();
  
  const [hours, setHours] = useState<WorkingHours>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editHours, setEditHours] = useState<WorkingHours>(DEFAULT_HOURS);

  const fetchProfile = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', profile.uid)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // ignore row not found
      
      if (data?.working_hours) {
        setHours({ ...DEFAULT_HOURS, ...data.working_hours });
      }
    } catch (err) {
      console.error('Failed to fetch business profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [profile]);

  const handleOpenEdit = () => {
    setEditHours(JSON.parse(JSON.stringify(hours))); // deep copy
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!profile?.uid) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('business_profiles')
        .upsert({ id: profile.uid, working_hours: editHours });
        
      if (error) throw error;
      setHours(editHours);
      setModalVisible(false);
    } catch (err) {
      console.error('Failed to save working hours', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleDayClosed = (day: Day) => {
    setEditHours(prev => ({
      ...prev,
      [day]: { ...prev[day], isClosed: !prev[day].isClosed }
    }));
  };

  // Mock time pickers by cycling hour shifts (for simplicity without extra packages)
  const cycleTime = (day: Day, field: 'open' | 'close') => {
    setEditHours(prev => {
      const current = prev[day][field];
      const [h, m] = current.split(':');
      const nextH = (parseInt(h, 10) + 1) % 24;
      return {
        ...prev,
        [day]: { ...prev[day], [field]: `${nextH.toString().padStart(2, '0')}:${m}` }
      };
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <Text style={[styles.header, { color: C.text }]}>Profile</Text>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing['4xl'] }}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: C.surface }]}>
            <Ionicons name="business" size={40} color={C.textSecondary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: C.text }]}>{profile?.displayName || 'Business Name'}</Text>
            <Text style={[styles.email, { color: C.textSecondary }]}>{profile?.email}</Text>
          </View>
        </View>

        {/* Working Hours Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Working Hours</Text>
          <TouchableOpacity onPress={handleOpenEdit} style={styles.editBtn}>
            <Ionicons name="pencil" size={16} color={Palette.accent} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.hoursCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          {loading ? (
            <ActivityIndicator size="small" color={C.text} style={{ padding: Spacing.xl }} />
          ) : (
            DAYS.map((day, idx) => (
              <View key={day} style={[
                styles.hourRow, 
                idx !== DAYS.length - 1 && { borderBottomColor: C.border, borderBottomWidth: StyleSheet.hairlineWidth }
              ]}>
                <Text style={[styles.dayText, { color: C.text }]}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                
                {hours[day].isClosed ? (
                  <Text style={[styles.closedText, { color: Palette.error }]}>Closed</Text>
                ) : (
                  <Text style={[styles.timeText, { color: C.textSecondary }]}>
                    {hours[day].open} - {hours[day].close}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        <TouchableOpacity 
          style={[styles.signOutButton, { borderColor: C.border }]} 
          onPress={signOut}
        >
          <Text style={[styles.signOutText, { color: Palette.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Hours Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={[styles.modalOverlayBg, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
          <View style={[styles.modalContent, { backgroundColor: C.backgroundSecondary }]}>
            <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
              <Text style={[styles.modalTitle, { color: C.text }]}>Edit Working Hours</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: Spacing.sm }}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.modalBody}>
              {DAYS.map(day => (
                <View key={day} style={styles.editRow}>
                   <TouchableOpacity 
                      style={styles.dayToggle} 
                      onPress={() => toggleDayClosed(day)}
                    >
                      <Ionicons 
                        name={editHours[day].isClosed ? "square-outline" : "checkbox"} 
                        size={22} 
                        color={editHours[day].isClosed ? C.textTertiary : Palette.accent} 
                      />
                      <Text style={[styles.editDayText, { color: C.text }]}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Text>
                   </TouchableOpacity>

                   {!editHours[day].isClosed ? (
                     <View style={styles.editTimes}>
                       <TouchableOpacity style={[styles.timePicker, { backgroundColor: C.surface, borderColor: C.border }]} onPress={() => cycleTime(day, 'open')}>
                         <Text style={{ color: C.text }}>{editHours[day].open}</Text>
                       </TouchableOpacity>
                       <Text style={{ color: C.textSecondary }}>to</Text>
                       <TouchableOpacity style={[styles.timePicker, { backgroundColor: C.surface, borderColor: C.border }]} onPress={() => cycleTime(day, 'close')}>
                         <Text style={{ color: C.text }}>{editHours[day].close}</Text>
                       </TouchableOpacity>
                     </View>
                   ) : (
                     <Text style={[styles.closedText, { color: Palette.error, paddingRight: Spacing.md }]}>Closed</Text>
                   )}
                </View>
              ))}

              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: Palette.accent }, saving && { opacity: 0.6 }]} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.xl },
  header: { fontSize: Typography.size['2xl'], fontWeight: Typography.weight.bold, marginBottom: Spacing.xl, paddingTop: Spacing.lg },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing['3xl'] },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg },
  profileInfo: { flex: 1 },
  name: { fontSize: Typography.size.title, fontWeight: Typography.weight.bold, marginBottom: Spacing.xs },
  email: { fontSize: Typography.size.body },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: '700' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: Spacing.sm },
  editBtnText: { color: Palette.accent, fontWeight: '600' },
  hoursCard: { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing['3xl'] },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.lg },
  dayText: { fontSize: Typography.size.md, fontWeight: '500' },
  timeText: { fontSize: Typography.size.md },
  closedText: { fontSize: Typography.size.md, fontWeight: '600' },
  signOutButton: { paddingVertical: Spacing.lg, alignItems: 'center', borderRadius: 12, borderWidth: 1 },
  signOutText: { fontSize: Typography.size.body, fontWeight: Typography.weight.semibold },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalOverlayBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: { borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle: { fontSize: Typography.size.lg, fontWeight: '700' },
  modalBody: { padding: Spacing.xl },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  dayToggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  editDayText: { fontSize: Typography.size.md, fontWeight: '500' },
  editTimes: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timePicker: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  saveButton: { backgroundColor: Palette.accent, padding: Spacing.xl, borderRadius: Radius.lg, alignItems: 'center', marginTop: Spacing.xl },
  saveText: { color: '#fff', fontSize: Typography.size.md, fontWeight: '600' }
});
