import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Returns the correctly-themed color tokens for the current system color scheme.
 * Usage: const C = useThemeColors();
 * Then use C.background, C.text, C.tint, etc.
 */
export function useThemeColors() {
    const scheme = useColorScheme() ?? 'light';
    return Colors[scheme];
}
