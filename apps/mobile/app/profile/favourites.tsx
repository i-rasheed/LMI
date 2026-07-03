import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../src/lib/query-keys';
import {
  fetchFavourites,
  removeFavourite,
} from '../../src/services/favourites.service';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const favouritesQuery = useQuery({
    queryKey: queryKeys.favourites.all,
    queryFn: fetchFavourites,
  });

  const removeMutation = useMutation({
    mutationFn: removeFavourite,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.favourites.all });
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Profile</Text>
        </Pressable>
        <Text style={styles.title}>Favourites</Text>
      </View>

      {favouritesQuery.isLoading ? (
        <View style={styles.loading}>
          <SkeletonBox height={72} />
          <SkeletonBox height={72} />
        </View>
      ) : favouritesQuery.isError ? (
        <ErrorState onRetry={() => void favouritesQuery.refetch()} />
      ) : (favouritesQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          headline="No favourites yet"
          body="Save products to track prices."
          ctaLabel="Search products"
          onCtaPress={() => router.push('/(tabs)/search')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={favouritesQuery.isRefetching}
              onRefresh={() => void favouritesQuery.refetch()}
              tintColor={colors.green.primary}
            />
          }
        >
          {favouritesQuery.data?.map((item) => (
            <View key={item.id} style={styles.card}>
              <Pressable
                style={styles.cardMain}
                onPress={() => router.push(`/product/${item.productId}`)}
              >
                <Text style={styles.product}>{item.product.name}</Text>
                <Text style={styles.meta}>{item.product.category}</Text>
              </Pressable>
              <Pressable onPress={() => removeMutation.mutate(item.productId)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  back: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  loading: {
    padding: spacing.screenHorizontal,
    gap: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  cardMain: {
    flex: 1,
  },
  product: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  remove: {
    ...typography.caption,
    color: colors.red.error,
    fontWeight: '700',
  },
});
