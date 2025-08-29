import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRScanner from '../../components/qr/QRScanner';
import { QRCodeData } from '../../services/QRCodeService';

const QRTestScreen: React.FC = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<QRCodeData | null>(null);

  const handleScanSuccess = (data: QRCodeData) => {
    setLastScanResult(data);
    Alert.alert(
      'QR Kod Başarıyla Okundu',
      `Plan: ${data.metadata?.planName || data.planId}\nTip: ${data.type}`,
      [{ text: 'Tamam' }]
    );
  };

  const handleScanError = (error: string) => {
    Alert.alert('Tarama Hatası', error, [{ text: 'Tamam' }]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QR Kod Test Ekranı</Text>
        <Text style={styles.subtitle}>
          QR kod tarayıcı ve doğrulama sistemini test etmek için kullanın
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setShowScanner(true)}
        >
          <Text style={styles.scanButtonText}>QR Kod Tara</Text>
        </TouchableOpacity>

        {lastScanResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Son Tarama Sonucu:</Text>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Tip:</Text>
              <Text style={styles.resultValue}>{lastScanResult.type}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Plan ID:</Text>
              <Text style={styles.resultValue}>{lastScanResult.planId}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Token ID:</Text>
              <Text style={styles.resultValue}>{lastScanResult.tokenId || 'N/A'}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Kullanıcı:</Text>
              <Text style={styles.resultValue}>{lastScanResult.userId}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Zaman:</Text>
              <Text style={styles.resultValue}>
                {new Date(parseInt(lastScanResult.timestamp)).toLocaleString()}
              </Text>
            </View>
            
            {lastScanResult.metadata && (
              <View style={styles.metadataContainer}>
                <Text style={styles.metadataTitle}>Metadata:</Text>
                <Text style={styles.metadataText}>
                  {JSON.stringify(lastScanResult.metadata, null, 2)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <QRScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  metadataContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default QRTestScreen;
