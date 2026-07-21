import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  showSpinner?: boolean;
  placeholder?: string;
  edgeToEdge?: boolean;
}

export function SearchBar({
  value = '',
  onChangeText,
  onPress,
  editable = true,
  autoFocus = false,
  showSpinner = false,
  placeholder = 'Search products and markets',
  edgeToEdge = false,
}: SearchBarProps) {
  if (!editable) {
    return (
      <Pressable onPress={onPress} style={[styles.wrapper, edgeToEdge && styles.edgeToEdge]}>
        <View style={styles.container}>
          <Ionicons name="search-outline" size={20} color={colors.neutral[400]} />
          <Text style={styles.placeholderText} numberOfLines={1}>
            {placeholder}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrapper, edgeToEdge && styles.edgeToEdge]}>
      <View style={styles.container}>
        <Ionicons name="search-outline" size={20} color={colors.neutral[400]} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {showSpinner ? (
          <Ionicons name="sync-outline" size={18} color={colors.neutral[400]} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenHorizontal,
  },
  edgeToEdge: {
    paddingHorizontal: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
    paddingVertical: spacing.sm,
  },
  placeholderText: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[400],
  },
});
