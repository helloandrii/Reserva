import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { decode } from 'base64-arraybuffer';

import { Strings } from '@/constants/strings';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editHours, setEditHours] = useState<WorkingHours>(DEFAULT_HOURS);
  
  // Profile Data
  const [category, setCategory] = useState<string>('');
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [addressDetails, setAddressDetails] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Form Edits
  const [editCategory, setEditCategory] = useState<string>('');
  const [editLocation, setEditLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [editAddressDetails, setEditAddressDetails] = useState('');

  const fetchProfile = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', profile.id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // ignore row not found
      
      if (data) {
        if (data.working_hours) setHours({ ...DEFAULT_HOURS, ...data.working_hours });
        setCategory(data.category || '');
        if (data.location) setLocation(data.location);
        setAddressDetails(data.address_details || '');
        setIsActive(data.is_active !== false); // Default to true if null/undefined
        setAvatarUrl(data.avatar_url || null);
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

  const handleOpenEditDetails = () => {
    setEditCategory(category);
    setEditAddressDetails(addressDetails);
    setEditLocation(location || { latitude: 48.1486, longitude: 17.1077 }); // Bratislava default
    setDetailsModalVisible(true);
  };

  const handleToggleActive = async (value: boolean) => {
    if (!profile?.id) return;
    setIsActive(value); // Optimistic UI update
    
    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('business_profiles')
        .update({ is_active: value })
        .eq('id', profile.id);
        
      if (profileError) throw profileError;

      // 2. Cascade update to all services
      const { error: servicesError } = await supabase
        .from('services')
        .update({ is_active: value })
        .eq('business_id', profile.id);

      if (servicesError) throw servicesError;
    } catch (err) {
      console.error('Failed to toggle active status', err);
      setIsActive(!value); // Revert UI
      Alert.alert('Error', 'Could not update active status. Try again.');
    }
  };

  const pickAndUploadAvatar = async () => {
    if (!profile?.id) return;
    
    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      aspect: [1, 1], // square for avatar
      base64: true,
    });

    if (result.canceled || !result.assets[0].base64) return;
    
    setAvatarUploading(true);
    try {
      const base64Data = result.assets[0].base64;
      const ext = 'jpeg';
      const fileName = `avatar_${Date.now()}.${ext}`;
      const filePath = `${profile.id}/${fileName}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64Data), { contentType: `image/${ext}`, upsert: true });
        
      if (uploadError) {
        // If the 'avatars' bucket hasn't been created yet, let the user know they need to make sure Storage is set up
        if (uploadError.message.includes('bucket not found')) {
           Alert.alert('Storage Error', 'The "avatars" storage bucket does not exist in Supabase.');
           return;
        }
        throw uploadError;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = publicData.publicUrl;

      // Update Profile Record
      const { error: updateError } = await supabase
        .from('business_profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', profile.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(newAvatarUrl);
    } catch (err) {
      console.error('Avatar upload failed', err);
      Alert.alert('Upload Error', 'Could not upload profile picture.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveHours = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('business_profiles')
        .upsert({ id: profile.id, working_hours: editHours });
        
      if (error) throw error;
      setHours(editHours);
      setModalVisible(false);
      Alert.alert('Success', 'Working hours updated successfully.');
    } catch (err) {
      console.error('Failed to save working hours', err);
      Alert.alert('Error', 'Failed to save working hours. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      // 1. Update business_profiles
      const { error: profileError } = await supabase
        .from('business_profiles')
        .upsert({ 
          id: profile.id, 
          category: editCategory, 
          location: editLocation,
          address_details: editAddressDetails.trim()
        });
        
      if (profileError) throw profileError;

      // 2. Cascade update to all services so they appear on map
      const { error: servicesError } = await supabase
        .from('services')
        .update({ 
          category: editCategory, 
          location: editLocation,
          address_details: editAddressDetails.trim() // Make sure services table has access if they need distinct mapping
        })
        .eq('business_id', profile.id);

      if (servicesError) throw servicesError;
      
      setCategory(editCategory);
      setLocation(editLocation);
      setAddressDetails(editAddressDetails.trim());
      setDetailsModalVisible(false);
      Alert.alert('Success', 'Business details updated successfully.');
    } catch (err) {
      console.error('Failed to save business details', err);
      Alert.alert('Error', 'Failed to save business details. Please try again.');
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
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={[styles.avatarPlaceholder, { backgroundColor: C.surface, overflow: 'hidden' }]}
            onPress={pickAndUploadAvatar}
            disabled={avatarUploading}
            activeOpacity={0.8}
          >
            {avatarUploading ? (
               <ActivityIndicator color={Palette.accent} />
            ) : avatarUrl ? (
               <Image source={avatarUrl} style={{ width: '100%', height: '100%' }} />
            ) : (
               <Ionicons name="camera-outline" size={40} color={C.textSecondary} />
            )}
            {!avatarUploading && (
              <View style={styles.avatarEditBadge}>
                <Ionicons name="pencil" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: C.text }]}>{profile?.displayName || 'Business Name'}</Text>
            <Text style={[styles.email, { color: C.textSecondary }]}>{profile?.email}</Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Status</Text>
        </View>
        <View style={[styles.detailsCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.detailRow]}>
            <View>
              <Text style={[styles.detailLabel, { color: C.text }]}>Accepting Bookings</Text>
              <Text style={{ color: C.textSecondary, fontSize: 12, marginTop: 4 }}>Visible to users across the app</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleToggleActive}
              trackColor={{ false: '#767577', true: Palette.accentLight }}
              thumbColor={isActive ? Palette.accent : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Business Details Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Business Details</Text>
          <TouchableOpacity onPress={handleOpenEditDetails} style={styles.editBtn}>
            <Ionicons name="pencil" size={16} color={Palette.accent} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.detailRow, { borderBottomColor: C.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[styles.detailLabel, { color: C.textSecondary }]}>Category</Text>
            <Text style={[styles.detailValue, { color: C.text }]}>{category || 'Not set'}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: C.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[styles.detailLabel, { color: C.textSecondary }]}>Address Details</Text>
            <Text style={[styles.detailValue, { color: C.text }]} numberOfLines={1}>
              {addressDetails || 'Not set'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: C.textSecondary }]}>Location</Text>
            <Text style={[styles.detailValue, { color: C.text }]} numberOfLines={1}>
              {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Not set'}
            </Text>
          </View>
        </View>

        {/* Working Hours Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Working Hours</Text>
          <TouchableOpacity onPress={() => {
            setEditHours(JSON.parse(JSON.stringify(hours)));
            setModalVisible(true);
          }} style={styles.editBtn}>
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
                onPress={handleSaveHours}
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

      {/* Edit Details Modal */}
      <Modal visible={detailsModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={[styles.modalOverlayBg, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
          <View style={[styles.modalContent, { backgroundColor: C.backgroundSecondary, height: '90%' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
              <Text style={[styles.modalTitle, { color: C.text }]}>Edit Business Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)} style={{ padding: Spacing.sm }}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Business Category</Text>
              <View style={styles.categoryGrid}>
                {Strings.map.categories.map((cat) => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[
                      styles.categoryLabel, 
                      { backgroundColor: C.surface, borderColor: C.border },
                      editCategory === cat && { backgroundColor: Palette.accent, borderColor: Palette.accent }
                    ]}
                    onPress={() => setEditCategory(cat)}
                  >
                    <Text style={[styles.categoryLabelText, { color: C.text }, editCategory === cat && { color: '#fff' }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: C.textSecondary, marginTop: Spacing.xl }]}>Address Details</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
                placeholder="e.g. Floor 2, Room 4B"
                placeholderTextColor={C.textTertiary}
                value={editAddressDetails}
                onChangeText={setEditAddressDetails}
              />

              <Text style={[styles.fieldLabel, { color: C.textSecondary, marginTop: Spacing.xs }]}>Location (Drag to adjust)</Text>
              <View style={[styles.mapContainer, { borderColor: C.border }]}>
                 <MapView
                    provider={PROVIDER_DEFAULT}
                    style={styles.map}
                    initialRegion={{
                      latitude: editLocation?.latitude || 48.1486,
                      longitude: editLocation?.longitude || 17.1077,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    onPress={(e) => setEditLocation(e.nativeEvent.coordinate)}
                 >
                    {editLocation && (
                      <Marker 
                        coordinate={editLocation} 
                        draggable
                        onDragEnd={(e) => setEditLocation(e.nativeEvent.coordinate)}
                        pinColor={Palette.accent}
                      />
                    )}
                 </MapView>
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: Palette.accent }, saving && { opacity: 0.6 }]} 
                onPress={handleSaveDetails}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save Details</Text>
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
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing['xl'] },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Palette.accent, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  profileInfo: { flex: 1 },
  name: { fontSize: Typography.size.title, fontWeight: Typography.weight.bold, marginBottom: Spacing.xs },
  email: { fontSize: Typography.size.body },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: '700' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: Spacing.sm },
  editBtnText: { color: Palette.accent, fontWeight: '600' },
  detailsCard: { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing['xl'], overflow: 'hidden' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.lg, alignItems: 'center' },
  detailLabel: { fontSize: Typography.size.body, fontWeight: '500' },
  detailValue: { fontSize: Typography.size.body, fontWeight: '600' },
  hoursCard: { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing['2xl'] },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.lg },
  dayText: { fontSize: Typography.size.md, fontWeight: '500' },
  timeText: { fontSize: Typography.size.md },
  closedText: { fontSize: Typography.size.md, fontWeight: '600' },
  signOutButton: { paddingVertical: Spacing.lg, alignItems: 'center', borderRadius: 12, borderWidth: 1 },
  signOutText: { fontSize: Typography.size.body, fontWeight: Typography.weight.semibold },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalOverlayBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: { borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle: { fontSize: Typography.size.lg, fontWeight: '700' },
  modalBody: { padding: Spacing.xl },
  fieldLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryLabel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1 },
  categoryLabelText: { fontSize: 14, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: Typography.size.md, marginBottom: Spacing.md },
  mapContainer: { height: 200, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, marginTop: Spacing.xs, marginBottom: Spacing.xl },
  map: { flex: 1 },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  dayToggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  editDayText: { fontSize: Typography.size.md, fontWeight: '500' },
  editTimes: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timePicker: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  saveButton: { backgroundColor: Palette.accent, padding: Spacing.xl, borderRadius: Radius.lg, alignItems: 'center', marginTop: Spacing.xs },
  saveText: { color: '#fff', fontSize: Typography.size.md, fontWeight: '600' }
});
