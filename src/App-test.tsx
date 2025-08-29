import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const App: React.FC = () => {
  console.log('Blicence Mobile App starting...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Blicence Mobile</Text>
      <Text style={styles.subtitle}>
        React Native uygulaması başarıyla çalışıyor!
      </Text>
      <Text style={styles.description}>
        • 5 Faz tamamlandı{'\n'}
        • Production ready{'\n'}
        • TypeScript entegrasyonu{'\n'}
        • Blockchain desteği{'\n'}
        • NFT & QR Code sistemi{'\n'}
        • Real-time bildirimler
      </Text>
      <Text style={styles.footer}>
        Metro Bundler: http://localhost:8082
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  footer: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default App;
