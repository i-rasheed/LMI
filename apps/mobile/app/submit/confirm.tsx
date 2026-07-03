import { submitPriceSchema } from '@lmi/shared';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { SubmitStepHeader } from '../../src/components/submit/SubmitStepHeader';
import { ApiError } from '../../src/lib/api';
import { explainOutlier } from '../../src/services/ai.service';
import { submitPrice } from '../../src/services/prices.service';
import { uploadSubmissionPhoto } from '../../src/services/storage.service';
import { useAuthStore } from '../../src/stores/authStore';
import { useSubmitStore } from '../../src/stores/submitStore';
import { formatPriceUnit } from '../../src/utils/formatPrice';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function SubmitConfirmScreen() {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((state) => state.user?.id);
  const draft = useSubmitStore();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outlierWarning, setOutlierWarning] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const summaryValid =
    draft.marketId &&
    draft.productId &&
    draft.priceNaira != null &&
    draft.unit;

  async function pickPhoto(source: 'camera' | 'library') {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera or photo access to add a photo.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });

    if (!result.canceled && result.assets[0]) {
      draft.setPhotoUri(result.assets[0].uri);
      draft.setPhotoUrl(null);
      setUploadError(null);
    }
  }

  async function ensurePhotoUploaded(): Promise<string | undefined> {
    if (draft.photoUrl) {
      return draft.photoUrl;
    }
    if (!draft.photoUri || !userId) {
      return undefined;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadSubmissionPhoto(draft.photoUri, userId);
      draft.setPhotoUrl(url);
      return url;
    } catch {
      setUploadError('Photo upload failed. Retry or submit without photo.');
      throw new Error('upload_failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(forceOutlier = false) {
    if (!summaryValid) {
      return;
    }

    setSubmitting(true);
    setOutlierWarning(null);

    try {
      let photoUrl: string | undefined;
      if (draft.photoUri && !draft.photoUrl) {
        try {
          photoUrl = await ensurePhotoUploaded();
        } catch {
          setSubmitting(false);
          return;
        }
      } else if (draft.photoUrl) {
        photoUrl = draft.photoUrl;
      }

      const payload = submitPriceSchema.parse({
        marketId: draft.marketId,
        productId: draft.productId,
        priceNaira: draft.priceNaira,
        unit: draft.unit,
        photoUrl: photoUrl ?? '',
        replacesSubmissionId: draft.replacesSubmissionId ?? undefined,
        confirmOutlier: forceOutlier || draft.confirmOutlier || undefined,
      });

      const response = await submitPrice(payload);
      draft.setLastSubmission(response);
      router.replace('/submit/success');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'OUTLIER_WARNING') {
          draft.setConfirmOutlier(true);
          const fallback =
            error.message ||
            'This price looks unusual. Are you sure you want to submit?';
          setOutlierWarning(fallback);
          if (
            draft.productName &&
            draft.marketName &&
            draft.unit &&
            draft.priceNaira != null
          ) {
            void explainOutlier({
              productName: draft.productName,
              marketName: draft.marketName,
              unit: draft.unit,
              submittedPriceNaira: draft.priceNaira,
            })
              .then((result) => setOutlierWarning(result.summary || fallback))
              .catch(() => undefined);
          }
          return;
        }
        if (error.code === 'DUPLICATE_SUBMISSION') {
          const minutes =
            typeof error.details?.retryAfterMinutes === 'number'
              ? error.details.retryAfterMinutes
              : 30;
          Alert.alert(
            'Already submitted',
            `You already submitted this price recently. Try again in ${minutes} minutes.`,
          );
          return;
        }
      }

      Alert.alert('Submission failed', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SubmitStepHeader title="Confirm & submit" step={4} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Market</Text>
          <Text style={styles.summaryValue}>{draft.marketName}</Text>
          <Text style={styles.summaryLabel}>Product</Text>
          <Text style={styles.summaryValue}>{draft.productName}</Text>
          <Text style={styles.summaryLabel}>Price</Text>
          <Text style={styles.summaryValue}>
            {draft.priceNaira != null && draft.unit
              ? formatPriceUnit(draft.priceNaira, draft.unit)
              : '—'}
          </Text>
        </View>

        {outlierWarning ? (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={20} color={colors.amber.warning} />
            <Text style={styles.warningText}>{outlierWarning}</Text>
          </View>
        ) : null}

        <Text style={styles.photoLabel}>Photo (optional)</Text>
        <Text style={styles.photoHint}>Make sure the price tag is visible</Text>

        {draft.photoUri ? (
          <View style={styles.photoPreview}>
            <Image source={{ uri: draft.photoUri }} style={styles.photoImage} />
            <Pressable
              onPress={() => {
                draft.setPhotoUri(null);
                draft.setPhotoUrl(null);
              }}
            >
              <Text style={styles.removePhoto}>Remove photo</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.photoActions}>
            <Pressable
              style={styles.photoButton}
              onPress={() => void pickPhoto('camera')}
            >
              <Ionicons name="camera-outline" size={22} color={colors.green.primary} />
              <Text style={styles.photoButtonText}>Camera</Text>
            </Pressable>
            <Pressable
              style={styles.photoButton}
              onPress={() => void pickPhoto('library')}
            >
              <Ionicons name="image-outline" size={22} color={colors.green.primary} />
              <Text style={styles.photoButtonText}>Gallery</Text>
            </Pressable>
          </View>
        )}

        {uploading ? (
          <View style={styles.uploadRow}>
            <ActivityIndicator color={colors.green.primary} />
            <Text style={styles.uploadText}>Uploading photo…</Text>
          </View>
        ) : null}

        {uploadError ? (
          <View style={styles.uploadError}>
            <Text style={styles.uploadErrorText}>{uploadError}</Text>
            <Pressable onPress={() => void ensurePhotoUploaded()}>
              <Text style={styles.retryText}>Retry upload</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label={outlierWarning ? 'Submit anyway' : 'Submit price'}
          loading={submitting || uploading}
          disabled={!summaryValid || submitting || uploading}
          onPress={() => void handleSubmit(Boolean(outlierWarning))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: spacing.sm,
  },
  summaryValue: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningText: {
    ...typography.body,
    color: colors.amber.warning,
    flex: 1,
  },
  photoLabel: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  photoHint: {
    ...typography.caption,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  photoActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    paddingVertical: spacing.lg,
  },
  photoButtonText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  photoPreview: {
    gap: spacing.sm,
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderRadius: radius.card,
    backgroundColor: colors.neutral[100],
  },
  removePhoto: {
    ...typography.body,
    color: colors.red.error,
    fontWeight: '600',
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  uploadText: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  uploadError: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  uploadErrorText: {
    ...typography.body,
    color: colors.red.error,
  },
  retryText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
  },
});
