import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import i18n from '@/shared/i18n';
import { reportError } from '@/shared/monitoring/errorReporting';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    reportError(error, {
      scope: 'ui.error_boundary',
      message: 'Unhandled UI error',
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text variant="titleMedium" style={styles.title}>
            {i18n.t('app.unhandledErrorTitle')}
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            {i18n.t('app.unhandledErrorDescription')}
          </Text>
          <Button mode="contained" onPress={this.handleRetry}>
            {i18n.t('common.retry')}
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
