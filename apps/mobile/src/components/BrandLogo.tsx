import { Image } from 'expo-image';
import { StyleSheet, View, ViewStyle } from 'react-native';

const logoSource = require('../../assets/lmi-logo.png');

interface BrandLogoProps {
  size?: number;
  style?: ViewStyle;
}

export function BrandLogo({ size = 88, style }: BrandLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image
        source={logoSource}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityLabel="LMI logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: 20,
  },
});

