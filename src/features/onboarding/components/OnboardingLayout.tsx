import React from 'react';
import { StyleSheet, View, Image, ImageSourcePropType, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingButton } from './OnboardingButton';

const { width: windowWidth } = Dimensions.get('window');

interface OnboardingLayoutProps {
  image?: ImageSourcePropType;
  title: string;
  description: string;
  onNext: () => void;
  onBack?: () => void;
  nextLabel: string;
  backLabel?: string;
  children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  image,
  title,
  description,
  onNext,
  onBack,
  nextLabel,
  backLabel,
  children,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { paddingTop: insets.top + (image ? 60 : 80) }]}>
        {image && (
          <View style={styles.imageWrapper}>
            <View style={[styles.glassFrame, { borderColor: theme.dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)' }]}>
              <Image source={image} style={styles.image} resizeMode="cover" />
            </View>
          </View>
        )}

        <View style={styles.header}>
          <Text 
            variant="headlineLarge" 
            style={[styles.title, { color: theme.colors.onBackground }]}
            adjustsFontSizeToFit
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          >
            {description}
          </Text>
        </View>

        <View style={styles.childrenContainer}>
          {children}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.buttonRow}>
          {onBack && backLabel ? (
            <OnboardingButton
              label={backLabel}
              onPress={onBack}
              mode="ghost"
              style={styles.backButton}
            />
          ) : <View style={styles.emptyNavSlot} />}
          
          <OnboardingButton
            label={nextLabel}
            onPress={onNext}
            mode="primary"
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  imageWrapper: {
    height: windowWidth * 0.5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  glassFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 32,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
    width: '100%',
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  childrenContainer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 32,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyNavSlot: {
    width: 60,
  },
  backButton: {
    // Handled by space-between
  },
  nextButton: {
    // Handled by space-between
  },
});
