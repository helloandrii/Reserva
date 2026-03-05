import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface Category {
    label: string;
    icon: IoniconName;
    color: string;
}

const ALL_CATEGORIES: Category[] = [
    { label: 'Hair', icon: 'cut-outline', color: '#E8D5F5' },
    { label: 'Beauty', icon: 'color-palette-outline', color: '#FFE4EC' },
    { label: 'Cleaning', icon: 'water-outline', color: '#D5EEF5' },
    { label: 'Fitness Classes', icon: 'barbell-outline', color: '#D5F5E3' },
    { label: 'Language', icon: 'language-outline', color: '#FFF3CD' },
    { label: 'Spa', icon: 'leaf-outline', color: '#D5F5E3' },
    { label: 'Massage', icon: 'hand-left-outline', color: '#F5E6D5' },
    { label: 'Car Detailing', icon: 'car-outline', color: '#D5E8F5' },
    { label: 'Photography', icon: 'camera-outline', color: '#F5D5E8' },
    { label: 'Pet Care', icon: 'paw-outline', color: '#EAD5F5' },
    { label: 'Tutoring', icon: 'school-outline', color: '#FDECD5' },
    { label: 'Nail Care', icon: 'sparkles-outline', color: '#FDE8F5' },
    { label: 'Personal Coach', icon: 'person-outline', color: '#E5F5D5' },
    { label: 'Yoga', icon: 'body-outline', color: '#D5F5EE' },
    { label: 'Nutrition', icon: 'nutrition-outline', color: '#F5F5D5' },
    { label: 'Therapy', icon: 'heart-outline', color: '#F5D5D5' },
    { label: 'Music Lessons', icon: 'musical-notes-outline', color: '#D5D5F5' },
    { label: 'Home Repair', icon: 'hammer-outline', color: '#F5EAD5' },
    { label: 'IT Support', icon: 'laptop-outline', color: '#D5ECF5' },
    { label: 'Legal', icon: 'briefcase-outline', color: '#EEE8F5' },
];

function CategoryRow({ item }: { item: Category }) {
    const C = useThemeColors();
    return (
        <TouchableOpacity style={[styles.row, { borderBottomColor: C.border }]} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={22} color={Palette.accentDark} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.textTertiary} />
        </TouchableOpacity>
    );
}

export default function CategoriesSheet() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const C = useThemeColors();

    return (
        <View style={[styles.container, { backgroundColor: C.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: C.border }]}>
                <Text style={[styles.title, { color: C.text }]}>All Categories</Text>
                <TouchableOpacity
                    style={[styles.closeBtn, { backgroundColor: C.backgroundSecondary }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="close" size={18} color={C.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={ALL_CATEGORIES}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => <CategoryRow item={item} />}
                contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing['2xl'],
        paddingVertical: Spacing.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    title: {
        fontSize: Typography.size.heading,
        fontWeight: Typography.weight.bold,
        letterSpacing: -0.3,
    },
    closeBtn: {
        width: 32, height: 32,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: { paddingTop: Spacing.sm },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing['2xl'],
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    iconWrap: {
        width: 44, height: 44,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        flex: 1,
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.medium,
    },
});
