import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { normalize, metrics } from '../../utils/responsive';
import MicroButton from '../../components/MicroButton';

const { width } = Dimensions.get('window');

const THEME = {
  primary: '#2F855A',
  text: {
    primary: '#FFFFFF',
    dark: '#1A202C'
  },
  gradients: {
    header: ['#1A4731', '#276749', '#2D8156'],
  }
};

const GameCard = ({ title, icon, description, onPress }) => (
  <TouchableOpacity style={styles.gameCard} onPress={onPress}>
    <View style={styles.gameIconContainer}>
      <MaterialCommunityIcons name={icon} size={32} color={THEME.primary} />
    </View>
    <View style={styles.gameInfo}>
      <Text style={styles.gameTitle}>{title}</Text>
      <Text style={styles.gameDescription}>{description}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color="#A0AEC0" />
  </TouchableOpacity>
);

export default function MiniGameScreen({ navigation }) {
  const games = [
    {
      title: 'Trí nhớ',
      icon: 'cards',
      description: 'Lật thẻ tìm cặp giống nhau',
      screen: 'MemoryCard'
    },
    {
      title: 'Ghép số',
      icon: 'numeric-2-box-multiple',
      description: 'Ghép số theo thứ tự',
      screen: 'NumberPuzzle'
    },
    {
      title: 'Sudoku',
      icon: 'grid',
      description: 'Giải đố với các con số',
      screen: 'Sudoku'
    }
  ];

  // Custom voice commands cho màn hình này
  const handleCustomCommands = (text) => {
    if (text.includes('sudoku')) {
      return 'Sudoku';
    }
    if (text.includes('nhớ') || text.includes('trí nhớ')) {
      return 'MemoryCard';
    }
    if (text.includes('số') || text.includes('xếp số')) {
      return 'NumberPuzzle';
    }
    if (text.includes('quay lại') || text.includes('trở về')) {
      return () => navigation.goBack();
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={THEME.gradients.header}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.mainTitle}>Mini Game</Text>
                <Text style={styles.subtitle}>Giải trí với các trò chơi đơn giản</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {games.map((game, index) => (
            <GameCard
              key={index}
              {...game}
              onPress={() => {
                if (game.screen) {
                  navigation.navigate(game.screen);
                } else {
                  console.log(`Selected game: ${game.title}`);
                }
              }}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
      <MicroButton 
        customCommands={handleCustomCommands}
        style={styles.microButton} // Tùy chỉnh vị trí nếu cần
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: normalize(24),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: normalize(14),
    color: 'rgba(255,255,255,0.9)',
    lineHeight: normalize(20),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gameIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${THEME.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: THEME.text.dark,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: normalize(14),
    color: '#718096',
  },
});
