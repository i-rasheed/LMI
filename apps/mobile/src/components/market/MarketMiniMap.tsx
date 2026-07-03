import MapView, { Marker } from 'react-native-maps';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../../theme';

interface MarketMiniMapProps {
  latitude: number;
  longitude: number;
  onPress?: () => void;
}

export function MarketMiniMap({ latitude, longitude, onPress }: MarketMiniMapProps) {
  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <MapView
        style={styles.map}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    borderRadius: radius.card,
    overflow: 'hidden',
    height: 200,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  map: {
    flex: 1,
  },
});
