import { PropsWithChildren } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

export function PhoneSimulator({ children }: PropsWithChildren) {
  const window = useWindowDimensions();

  if (Platform.OS !== 'web') return <>{children}</>;

  const width = Math.min(390, Math.max(300, window.width - 24));
  const height = Math.min(780, Math.max(560, window.height - 24));

  return (
    <View style={styles.canvas}>
      <View style={[styles.phone, { width, height, borderRadius: Math.min(56, width * 0.14) }]}>
        <View style={styles.island} />
        <View style={styles.screen}>{children}</View>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
    overflow: 'hidden',
  },
  phone: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#111113',
    borderWidth: 8,
    borderColor: '#242428',
    shadowColor: '#000',
    shadowOpacity: 0.65,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 22 },
    elevation: 18,
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
    paddingTop: 26,
    paddingBottom: 12,
    backgroundColor: '#F5F5F7',
  },
  island: {
    position: 'absolute',
    zIndex: 10,
    top: 8,
    alignSelf: 'center',
    width: 108,
    height: 28,
    borderRadius: 20,
    backgroundColor: '#000',
  },
  homeIndicator: {
    position: 'absolute',
    zIndex: 10,
    bottom: 7,
    alignSelf: 'center',
    width: 92,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.9,
  },
});
