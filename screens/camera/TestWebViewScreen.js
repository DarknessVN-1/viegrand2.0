import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const TestWebViewScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [url, setUrl] = useState(route.params?.url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadUrl = () => {
    if (!url) return;
    setLoading(true);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test WebView</Text>
        <View style={{width: 40}} />
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="Nhập URL video để test"
          autoCapitalize="none"
          selectTextOnFocus
          returnKeyType="go"
          onSubmitEditing={loadUrl}
        />
        <TouchableOpacity 
          style={styles.loadButton}
          onPress={loadUrl}
        >
          <Text style={styles.loadButtonText}>Load</Text>
        </TouchableOpacity>
      </View>
      
      {url ? (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: url }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={(e) => {
              console.error('WebView error:', e.nativeEvent);
              setError(e.nativeEvent.description || 'Lỗi không xác định');
              setLoading(false);
            }}
          />
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          )}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Lỗi: {error}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Nhập URL và nhấn Load để kiểm tra</Text>
          {user?.user_id && (
            <TouchableOpacity 
              style={styles.sampleButton}
              onPress={() => {
                const sampleUrl = `https://servers.works/video.bedroom.${user.user_id}/video`;
                setUrl(sampleUrl);
              }}
            >
              <Text style={styles.sampleButtonText}>Dùng URL mẫu</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  loadButton: {
    marginLeft: 12,
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
  },
  sampleButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  sampleButtonText: {
    color: colors.primary,
    fontWeight: '600',
  }
});

export default TestWebViewScreen;
