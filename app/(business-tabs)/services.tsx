import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { decode } from 'base64-arraybuffer';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/utils/supabase';

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  photo_urls: string[] | null;
}

export default function BusinessServicesScreen() {
  const C = useThemeColors();
  const { user } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form bounds
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  // Local base64 to display prior to save
  const [localImageBase64, setLocalImageBase64] = useState<string | null>(null);

  const fetchServices = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Failed to fetch services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setDescription('');
    setPhotoUrl(null);
    setLocalImageBase64(null);
    setModalVisible(true);
  };

  const openEditModal = (service: Service) => {
    setEditingId(service.id);
    setName(service.name);
    setPrice(service.price.toString());
    setDescription(service.description || '');
    setPhotoUrl(service.photo_urls?.[0] || null);
    setLocalImageBase64(null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setLocalImageBase64(result.assets[0].base64);
    }
  };

  const uploadImageObj = async (): Promise<string | null> => {
    if (!localImageBase64) return photoUrl; // keep existing if no new one
    
    try {
      const ext = 'jpeg'; // assuming high 0.5 compression comes out standard
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${user?.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('services')
        .upload(filePath, decode(localImageBase64), { contentType: `image/${ext}` });
        
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('services')
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    } catch (err) {
      console.error('Image upload failed', err);
      // Fail silently and return prior if error to avoid entire form crashing
      return photoUrl; 
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price) {
      Alert.alert('Missing Fields', 'Please enter a name and a price for the service.');
      return;
    }
    if (!user) return;
    
    setSaving(true);
    try {
      const finalPhotoUrl = await uploadImageObj();
      
      const payload = {
        business_id: user.id,
        name: name.trim(),
        price: parseFloat(price.trim()),
        description: description.trim(),
        photo_urls: finalPhotoUrl ? [finalPhotoUrl] : [],
      };

      if (editingId) {
        const { error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert([payload]);
        if (error) throw error;
      }

      setModalVisible(false);
      fetchServices();
    } catch (err: any) {
      console.error('Save failed:', err);
      Alert.alert('Save Failed', err?.message || 'Unknown error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    
    Alert.alert("Delete Service", "Are you sure you want to permanently delete this service?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            const { error } = await supabase
              .from('services')
              .delete()
              .eq('id', editingId);
              
            if (error) throw error;
            setModalVisible(false);
            fetchServices();
          } catch (err: any) {
            console.error('Delete failed:', err);
            Alert.alert("Error", "Could not delete service.");
          } finally {
            setDeleting(false);
          }
        }
      }
    ]);
  };

  const currentDisplayImage = localImageBase64 
    ? `data:image/jpeg;base64,${localImageBase64}` 
    : photoUrl;

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity 
      style={[styles.serviceCard, { backgroundColor: C.surface, borderColor: C.border }]}
      onPress={() => openEditModal(item)}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        {item.photo_urls?.[0] ? (
          <Image source={item.photo_urls[0]} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImagePlaceholder, { backgroundColor: C.backgroundSecondary }]}>
            <Ionicons name="image-outline" size={24} color={C.textTertiary} />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Text style={[styles.serviceName, { color: C.text }]}>{item.name}</Text>
          {item.description ? (
            <Text style={[styles.serviceDesc, { color: C.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={[styles.priceTag, { backgroundColor: Palette.accentLight }]}>
        <Text style={[styles.priceText, { color: Palette.accentDark }]}>${item.price}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={C.textTertiary} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: C.text }]}>Services</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Palette.accent }]}
          onPress={openAddModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerFlex}>
          <ActivityIndicator size="large" color={C.text} />
        </View>
      ) : services.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Ionicons name="sparkles-outline" size={48} color={C.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={[styles.emptyText, { color: C.textSecondary }]}>No services added yet</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalOverlayBg, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
          <View style={[styles.modalContent, { backgroundColor: C.backgroundSecondary }]}>
            <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
              <Text style={[styles.modalTitle, { color: C.text }]}>{editingId ? 'Edit Service' : 'Add Service'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={saving || deleting}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.imagePickerWrap}>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage} activeOpacity={0.8}>
                  {currentDisplayImage ? (
                    <Image source={currentDisplayImage} style={styles.pickedImage} />
                  ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: C.surface, borderColor: C.border }]}>
                      <Ionicons name="camera" size={32} color={C.textTertiary} />
                      <Text style={[styles.imagePlaceholderText, { color: C.textSecondary }]}>Add Photo</Text>
                    </View>
                  )}
                  {currentDisplayImage && (
                    <View style={styles.editImageBadge}>
                      <Ionicons name="pencil" size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: C.text }]}>Service Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
                placeholder="e.g. Men's Haircut"
                placeholderTextColor={C.textTertiary}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.label, { color: C.text }]}>Price ($) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
                placeholder="e.g. 25"
                placeholderTextColor={C.textTertiary}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />

              <Text style={[styles.label, { color: C.text }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
                placeholder="Briefly describe what this includes..."
                placeholderTextColor={C.textTertiary}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />

              <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md }}>
                {editingId && (
                  <TouchableOpacity
                    style={[styles.saveButton, { flex: 0.3, backgroundColor: Palette.error, paddingHorizontal: 0 }, deleting && { opacity: 0.6 }]}
                    onPress={handleDelete}
                    disabled={saving || deleting}
                  >
                    {deleting ? <ActivityIndicator color="#fff" /> : <Ionicons name="trash" size={20} color="#fff" />}
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.saveButton, { flex: 1, backgroundColor: Palette.accent }, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving || deleting}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>{editingId ? 'Save Changes' : 'Create Service'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  centerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: Typography.size.sm,
  },
  emptyState: {
    padding: Spacing['3xl'],
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.size.md,
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
  },
  cardImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  serviceDesc: {
    fontSize: Typography.size.sm,
    marginTop: 4,
    lineHeight: 18,
  },
  priceTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginLeft: Spacing.md,
  },
  priceText: {
    fontWeight: '700',
    fontSize: Typography.size.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingBottom: Spacing['4xl'], // safety margin
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '600',
  },
  modalBody: {
    padding: Spacing.xl,
  },
  imagePickerWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  imagePickerBtn: {
    width: 120,
    height: 120,
    borderRadius: Radius.lg,
    overflow: 'visible',
  },
  pickedImage: {
    width: 120,
    height: 120,
    borderRadius: Radius.lg,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
  editImageBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: Palette.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  label: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.size.md,
    marginBottom: Spacing.lg,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  saveText: {
    color: '#fff',
    fontSize: Typography.size.md,
    fontWeight: '600',
  },
});
