import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({
  label,
  error,
  style,
  secureTextEntry,
  ...props
}: FormFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = secureTextEntry === true;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor={colors.neutral[400]}
          style={[
            styles.input,
            isPasswordField && styles.inputWithToggle,
            error ? styles.inputError : null,
            style,
          ]}
          secureTextEntry={isPasswordField && !isPasswordVisible}
          {...props}
        />
        {isPasswordField ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Hide password' : 'Show password'
            }
            hitSlop={8}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            style={styles.toggleButton}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.neutral[600]}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.compact,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    minHeight: 52,
    ...typography.body,
    color: colors.neutral[900],
  },
  inputWithToggle: {
    paddingRight: spacing.xl + spacing.md,
  },
  toggleButton: {
    position: 'absolute',
    right: spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.red.error,
  },
  error: {
    ...typography.caption,
    color: colors.red.error,
  },
});
