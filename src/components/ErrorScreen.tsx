/**
 * Full-screen error state component.
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Strings } from '@/constants/strings';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

interface ErrorScreenProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
    return (
        <View style={styles.container}>
            <View style={styles.icon}>
                <Ionicons name="alert-circle-outline" size={48} color="#555" />
            </View>
            <Text style={styles.title}>{Strings.common.error}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {onRetry ? (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <Text style={styles.retryText}>{Strings.common.retry}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.lg,
        padding: Spacing['3xl'],
        backgroundColor: Colors.dark.background,
    },
    icon: {
        width: 88,
        height: 88,
        borderRadius: Radius.xl,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: Colors.dark.text,
    },
    message: {
        fontSize: Typography.size.md,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        lineHeight: Typography.size.md * 1.5,
    },
    retryButton: {
        paddingHorizontal: Spacing['2xl'],
        paddingVertical: Spacing.md,
        borderRadius: Radius.lg,
        backgroundColor: '#fff',
        marginTop: Spacing.sm,
    },
    retryText: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.semibold,
        color: '#000',
    },
});
