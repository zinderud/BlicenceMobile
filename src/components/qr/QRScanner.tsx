import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration, Modal } from 'react-native';
// import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
// import { runOnJS } from 'react-native-reanimated';
import QRCodeService, { QRCodeData } from '../../services/QRCodeService';

interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: QRCodeData) => void;
  onScanError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  visible,
  onClose,
  onScanSuccess,
  onScanError
}) => {
  const [hasPermission, setHasPermission] = useState<boolean>(true); // Mock için true
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [mockScanTriggered, setMockScanTriggered] = useState(false);

  useEffect(() => {
    // Mock kamera izni
    setHasPermission(true);
  }, []);

  useEffect(() => {
    // Mock QR tarama simülasyonu
    if (visible && isScanning && !mockScanTriggered) {
      setMockScanTriggered(true);
      
      const timer = setTimeout(() => {
        if (isScanning) {
          const mockQRData: QRCodeData = {
            type: 'plan_verification',
            planId: 'plan-123',
            userId: 'user-123',
            tokenId: '1',
            timestamp: Date.now().toString(),
            signature: 'mock-signature',
            metadata: {
              planType: 'api',
              planName: 'Test API Planı',
              features: ['unlimited_api', 'priority_support']
            }
          };
          
          handleQRCodeDetected(JSON.stringify(mockQRData));
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, isScanning, mockScanTriggered]);

  const requestCameraPermission = async () => {
    // Mock implementasyon
    setHasPermission(true);
  };

  const handleQRCodeDetected = async (value: string) => {
    if (!isScanning || scanResult === value) return;
    
    setIsScanning(false);
    setScanResult(value);
    Vibration.vibrate(100);

    try {
      // QR kodu parse et ve doğrula
      const qrData = JSON.parse(value) as QRCodeData;
      
      // QR kodunu doğrula
      const isValid = await QRCodeService.validateQRCode(value);
      
      if (isValid) {
        onScanSuccess(qrData);
        onClose();
      } else {
        Alert.alert(
          'Geçersiz QR Kod',
          'Bu QR kod geçersiz veya süresi dolmuş.',
          [
            {
              text: 'Tekrar Dene',
              onPress: () => {
                setScanResult(null);
                setIsScanning(true);
                setMockScanTriggered(false);
              }
            },
            { text: 'İptal', onPress: onClose }
          ]
        );
      }
    } catch (error) {
      console.error('QR code validation error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'QR kod işlenirken hata oluştu';
        
      onScanError?.(errorMessage);
      
      Alert.alert(
        'QR Kod Hatası',
        errorMessage,
        [
          {
            text: 'Tekrar Dene',
            onPress: () => {
              setScanResult(null);
              setIsScanning(true);
              setMockScanTriggered(false);
            }
          },
          { text: 'İptal', onPress: onClose }
        ]
      );
    }
  };

  if (!visible) return null;

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
            <Text style={styles.permissionText}>
              QR kod taramak için kamera erişimi gerekiyor.
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={requestCameraPermission}
            >
              <Text style={styles.permissionButtonText}>İzin Ver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>QR Kod Tarayıcı</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Camera View - Mock implementasyon */}
        <View style={styles.cameraContainer}>
          <View style={styles.mockCamera}>
            <Text style={styles.mockCameraText}>Kamera Görünümü</Text>
            <Text style={styles.mockCameraSubtext}>
              {isScanning ? 'QR kod aranıyor...' : 'İşleniyor...'}
            </Text>
          </View>
          
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Top overlay */}
            <View style={styles.overlayTop}>
              <Text style={styles.instructionText}>
                QR kodu çerçeve içine getirin
              </Text>
            </View>
            
            {/* Middle overlay with scanning frame */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlayMiddleLeft} />
              
              <View style={styles.scanFrame}>
                {/* Scanning corners */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                
                {/* Scanning line animation would go here */}
                {isScanning && (
                  <View style={styles.scanLine} />
                )}
              </View>
              
              <View style={styles.overlayMiddleRight} />
            </View>
            
            {/* Bottom overlay */}
            <View style={styles.overlayBottom}>
              <Text style={styles.statusText}>
                {isScanning ? 'Taranıyor...' : 'İşleniyor...'}
              </Text>
              
              {!isScanning && (
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => {
                    setScanResult(null);
                    setIsScanning(true);
                  }}
                >
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 80,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  mockCamera: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockCameraText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  mockCameraSubtext: {
    color: '#ccc',
    fontSize: 14,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 250,
  },
  overlayMiddleLeft: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  overlayMiddleRight: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#007AFF',
    top: '50%',
    opacity: 0.8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#000',
  },
  permissionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRScanner;
