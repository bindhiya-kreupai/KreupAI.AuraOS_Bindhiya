/**
 * ErrorBoundary — crash boundary with retry + report. Mobile #112.
 *
 * React Error Boundaries must be class components — function-component
 * `useErrorBoundary` hooks aren't supported in React Native's React 18.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <View style={styles.action}>
            <Button label="Try again" onPress={this.reset} variant="primary" />
          </View>
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
    padding: 24,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#991B1B', marginBottom: 8 },
  message: { fontSize: 14, color: '#4B5563', textAlign: 'center' },
  action: { marginTop: 16 },
});
