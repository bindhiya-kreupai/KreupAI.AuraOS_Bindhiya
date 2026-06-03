/**
 * Avatar — employee photo with fallback initials. Mobile #112.
 */
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

// Stable color hash for consistent per-name colors.
function hueFor(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const dim = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return (
      <Image
        source={{ uri }}
        accessibilityLabel={`Avatar for ${name}`}
        style={[styles.image, dim]}
      />
    );
  }
  const hue = hueFor(name);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Avatar placeholder for ${name}`}
      style={[styles.fallback, dim, { backgroundColor: `hsl(${hue}, 70%, 85%)` }]}
    >
      <Text style={[styles.initials, { color: `hsl(${hue}, 60%, 30%)`, fontSize: size * 0.4 }]}>
        {initialsOf(name) || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {},
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
});
