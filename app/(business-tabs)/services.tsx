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
// ... (imports remain)
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/utils/supabase';

// ... (Service interface and BusinessServicesScreen setup remain exactly the same)
interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
}

export default function BusinessServicesScreen() {
  const C = useThemeColors();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form bounds
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

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

  const handleSave = async () => {
    if (!name.trim() || !price) {
      Alert.alert('Missing Fields', 'Please enter a name and a price for the service.');
      return;
    }
    if (!user) {
      Alert.alert('Auth Error', 'Could not find your business ID. Try logging out and back in again.');
      return;
    }
    
    setSaving(true);
    try {
      const newService = {
        business_id: user.id,
        name: name.trim(),
        price: parseFloat(price.trim()),
        description: description.trim(),
      };

      console.log('Inserting new service:', newService);
      const { data, error } = await supabase.from('services').insert([newService]).select();
      
      console.log('Insert response:', { data, error });
      if (error) throw error;

      setModalVisible(false);
      setName('');
      setPrice('');
      setDescription('');
      fetchServices();
    } catch (err: any) {
      console.error('Save failed:', err);
      Alert.alert('Save Failed', err?.message || JSON.stringify(err) || 'Unknown error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <View style={[styles.serviceCard, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.serviceName, { color: C.text }]}>{item.name}</Text>
        {item.description ? (
          <Text style={[styles.serviceDesc, { color: C.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.priceTag, { backgroundColor: Palette.accentLight }]}>
        <Text style={[styles.priceText, { color: Palette.accentDark }]}>${item.price}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: C.text }]}>Services</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Palette.accent }]}
          onPress={() => setModalVisible(true)}
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

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalOverlayBg, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
          <View style={[styles.modalContent, { backgroundColor: C.backgroundSecondary }]}>
            <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
              <Text style={[styles.modalTitle, { color: C.text }]}>Add Service</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
            >
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

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: Palette.accent }, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save Service</Text>
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
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
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
    marginTop: Spacing.md,
  },
  saveText: {
    color: '#fff',
    fontSize: Typography.size.md,
    fontWeight: '600',
  },
});
