import { Platform, type TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

type TextPreset = Pick<TextStyle, 'fontSize' | 'fontWeight' | 'lineHeight'>;

export const typography: Record<
  'displayLarge' | 'title' | 'heading' | 'subheading' | 'body' | 'bodySmall' | 'caption' | 'label',
  TextPreset
> = {
  displayLarge: { fontSize: 32, fontWeight: '700', lineHeight: 38 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  heading: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  subheading: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
};

export { fontFamily };
