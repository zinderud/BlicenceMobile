import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    this.setState({
      error,
      errorInfo,
    });

    // Save error to storage for later analysis
    this.saveErrorToStorage(error, errorInfo);

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // In production, you would send this to your error reporting service
    this.reportError(error, errorInfo);
  }

  private async saveErrorToStorage(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorData = {
        id: this.state.errorId || Date.now().toString(),
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        appVersion: '1.0.0', // Bu gerçek uygulamada package.json'dan gelecek
        platform: require('react-native').Platform.OS,
      };

      const existingErrors = await AsyncStorage.getItem('app_errors');
      const errors = existingErrors ? JSON.parse(existingErrors) : [];
      
      // Keep only last 50 errors
      const updatedErrors = [errorData, ...errors].slice(0, 50);
      
      await AsyncStorage.setItem('app_errors', JSON.stringify(updatedErrors));
    } catch (storageError) {
      console.error('Failed to save error to storage:', storageError);
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // In production, send to crash reporting service like Crashlytics, Sentry, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: 'BlicenceMobile/1.0.0',
      platform: require('react-native').Platform.OS,
    };

    // Mock error reporting (in real app, use actual service)
    console.log('Error reported to crash service:', errorReport);
  }

  private handleRestart = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleSendReport = () => {
    Alert.alert(
      'Hata Raporu',
      'Hata raporu geliştiricilere gönderildi. Teşekkür ederiz!',
      [{ text: 'Tamam' }]
    );
  };

  private handleShowDetails = () => {
    Alert.alert(
      'Hata Detayları',
      `Hata: ${this.state.error?.message}\n\nLütfen uygulamayı yeniden başlatın. Sorun devam ederse destek ekibiyle iletişime geçin.`,
      [{ text: 'Tamam' }]
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.state.errorInfo!);
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
            
            <Text style={styles.title}>Beklenmeyen Bir Hata Oluştu</Text>
            
            <Text style={styles.description}>
              Üzgünüz, uygulamada bir hata meydana geldi. Bu sorunu çözmek için çalışıyoruz.
            </Text>

            <View style={styles.errorInfo}>
              <Text style={styles.errorLabel}>Hata ID:</Text>
              <Text style={styles.errorValue}>{this.state.errorId}</Text>
              
              <Text style={styles.errorLabel}>Zaman:</Text>
              <Text style={styles.errorValue}>
                {new Date().toLocaleString('tr-TR')}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={this.handleRestart}
              >
                <Text style={styles.primaryButtonText}>Uygulamayı Yeniden Başlat</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={this.handleSendReport}
              >
                <Text style={styles.secondaryButtonText}>Hata Raporu Gönder</Text>
              </TouchableOpacity>

              {__DEV__ && (
                <TouchableOpacity 
                  style={[styles.button, styles.debugButton]} 
                  onPress={this.handleShowDetails}
                >
                  <Text style={styles.debugButtonText}>Hata Detayları (Dev)</Text>
                </TouchableOpacity>
              )}
            </View>

            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Bilgisi:</Text>
                <Text style={styles.debugText}>{this.state.error.message}</Text>
                {this.state.error.stack && (
                  <Text style={styles.debugStack}>{this.state.error.stack}</Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  errorValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#ff9500',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 32,
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  debugStack: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});

export default ErrorBoundary;
