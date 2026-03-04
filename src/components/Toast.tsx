/**
 * Toast notification system — global success/error/info toasts.
 * Wrap your app in <ToastProvider>, then call useToast() from any screen.
 */

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

// ─── Toast item ───────────────────────────────────────────────────────────────

function ToastItem({ toast, onDone }: { toast: ToastMessage; onDone: (id: string) => void }) {
    const insets = useSafeAreaInsets();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                    Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
                ]).start(() => onDone(toast.id));
            }, 2800);
        });
    }, []);

    const bg =
        toast.type === 'success' ? Colors.dark.success :
            toast.type === 'error' ? Colors.dark.error : Colors.dark.info;

    return (
        <Animated.View
            style={[
                styles.toast,
                { backgroundColor: bg, opacity, transform: [{ translateY }], top: insets.top + 12 },
            ]}
        >
            <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
    );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <View style={styles.container} pointerEvents="none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDone={removeToast} />
                ))}
            </View>
        </ToastContext.Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 999,
    },
    toast: {
        position: 'absolute',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.full,
        maxWidth: 320,
    },
    toastText: {
        color: '#fff',
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.semibold,
        textAlign: 'center',
    },
});
