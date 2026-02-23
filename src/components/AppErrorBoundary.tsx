import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    if (__DEV__) {
      console.error('App error boundary caught:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bir hata oluştu</Text>
          <Text style={styles.text}>
            Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
          </Text>
          <Pressable
            style={styles.button}
            onPress={this.handleReset}
            accessibilityLabel="Uygulamayı yeniden dene"
            accessibilityHint="Hata ekranını kapatır ve uygulamayı tekrar dener"
          >
            <Text style={styles.buttonText}>Yeniden Dene</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },
  text: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold'
  }
});
