import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Dimensions, Alert, Animated, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { normalize } from '../../utils/responsive';

const THEME = {
  primary: '#2F855A',
  secondary: '#38A169',
  text: {
    primary: '#FFFFFF',
    dark: '#1A202C'
  },
  gradients: {
    header: ['#1A4731', '#276749', '#2D8156'],
  }
};

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 80) / 4;

const CARD_SYMBOLS = [
  { icon: 'cat', color: '#FF6B6B' },
  { icon: 'dog', color: '#4ECDC4' },
  { icon: 'rabbit', color: '#45B7D1' },
  { icon: 'pig', color: '#96CEB4' },
  { icon: 'penguin', color: '#4A90E2' },
  { icon: 'owl', color: '#9B59B6' },
  { icon: 'elephant', color: '#F1C40F' },
  { icon: 'cow', color: '#E67E22' }
];

export default function MemoryCardScreen({ navigation }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isCheckingMatch, setIsCheckingMatch] = useState(false);
  const [cardRotations] = useState(() => {
    return Array(16).fill(0).map(() => new Animated.Value(0));
  });
  const [showTutorial, setShowTutorial] = useState(true);
  const [visibleFaces, setVisibleFaces] = useState(Array(16).fill(false));
  const resetButtonRef = useRef(null);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Reset animation values
    cardRotations.forEach(rotation => rotation.setValue(0));
    
    // Reset all visible faces
    setVisibleFaces(Array(16).fill(false));
    
    // Shuffle cards
    const shuffledCards = [...CARD_SYMBOLS, ...CARD_SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        ...symbol,
        isFlipped: false,
        isMatched: false
      }));

    // Reset all states
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setScore(1000);
    setIsCheckingMatch(false);

    // Add feedback animation for the reset button
    if (resetButtonRef.current) {
      resetButtonRef.current.setNativeProps({
        style: { transform: [{ rotate: '360deg' }] }
      });
    }

    // Optional: Add visual feedback for reset
    Alert.alert(
      "Game mới",
      "Trò chơi đã được làm mới!",
      [{ text: "Bắt đầu", style: "default" }]
    );
  };

  const flipCard = (index) => {
    Animated.sequence([
      Animated.timing(cardRotations[index], {
        toValue: 180,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisibleFaces(prev => {
        const updated = [...prev];
        updated[index] = true;
        return updated;
      });
    });
  };

  const unflipCard = (index) => {
    Animated.sequence([
      Animated.timing(cardRotations[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisibleFaces(prev => {
        const updated = [...prev];
        updated[index] = false;
        return updated;
      });
    });
  };

  const handleCardPress = (index) => {
    if (isCheckingMatch || flippedIndices.includes(index) || matchedPairs.includes(cards[index].icon)) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    flipCard(index);

    if (newFlipped.length === 2) {
      setIsCheckingMatch(true);
      setMoves(moves + 1);

      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].icon === cards[secondIndex].icon) {
        // Match found
        setMatchedPairs([...matchedPairs, cards[firstIndex].icon]);
        setFlippedIndices([]);
        setIsCheckingMatch(false);
        setScore(prev => prev + 100); // Add 100 points for match

        if (matchedPairs.length === CARD_SYMBOLS.length - 1) {
          const finalScore = score + 100;
          if (finalScore > bestScore) {
            setBestScore(finalScore);
          }
          setTimeout(() => {
            Alert.alert(
              "🎉 Chúc mừng! 🎉",
              `Điểm số: ${finalScore}\nKỷ lục: ${Math.max(bestScore, finalScore)}\nSố lượt: ${moves + 1}`,
              [{ text: "Chơi lại", onPress: startNewGame }]
            );
          }, 500);
        }
      } else {
        // No match
        setTimeout(() => {
          unflipCard(firstIndex);
          unflipCard(secondIndex);
          setFlippedIndices([]);
          setIsCheckingMatch(false);
          setScore(prev => Math.max(0, prev - 50)); // Subtract 50 points for mismatch
        }, 1000);
      }
    }
  };

  const renderCard = (card, index) => {
    const isFlipped = flippedIndices.includes(index);
    const isMatched = matchedPairs.includes(card.icon);
    const showFront = visibleFaces[index];
    
    const frontInterpolate = cardRotations[index].interpolate({
      inputRange: [0, 180],
      outputRange: ['180deg', '360deg']
    });

    const backInterpolate = cardRotations[index].interpolate({
      inputRange: [0, 180],
      outputRange: ['0deg', '180deg']
    });

    const frontAnimatedStyle = {
      transform: [
        { rotateY: frontInterpolate }
      ]
    };

    const backAnimatedStyle = {
      transform: [
        { rotateY: backInterpolate }
      ]
    };

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleCardPress(index)}
        activeOpacity={0.7}
        style={styles.cardContainer}
      >
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            backAnimatedStyle,
            showFront && styles.hiddenFace
          ]}
        >
          <LinearGradient
            colors={['#2F855A', '#276749']}
            style={styles.cardGradient}
          >
            <MaterialCommunityIcons
              name="card-outline"
              size={40}
              color="#FFFFFF"
            />
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFront,
            frontAnimatedStyle,
            !showFront && styles.hiddenFace
          ]}
        >
          <MaterialCommunityIcons
            name={card.icon}
            size={40}
            color={card.color}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const Tutorial = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showTutorial}
      onRequestClose={() => setShowTutorial(false)}
    >
      <View style={styles.tutorialContainer}>
        <View style={styles.tutorialContent}>
          <Text style={styles.tutorialTitle}>Hướng dẫn chơi</Text>
          
          <View style={styles.tutorialStep}>
            <MaterialCommunityIcons name="card-multiple" size={24} color={THEME.primary} />
            <Text style={styles.tutorialText}>
              Lật các thẻ để tìm cặp giống nhau
            </Text>
          </View>

          <View style={styles.tutorialStep}>
            <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
            <Text style={styles.tutorialText}>
              Mỗi cặp đúng: +100 điểm{'\n'}
              Mỗi lần sai: -50 điểm
            </Text>
          </View>

          <View style={styles.tutorialStep}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FFA500" />
            <Text style={styles.tutorialText}>
              Hoàn thành với điểm cao nhất để phá kỷ lục!
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setShowTutorial(false)}
          >
            <Text style={styles.startButtonText}>Bắt đầu chơi</Text>
          </TouchableOpacity>

          <Text style={styles.tutorialNote}>
            Bấm nút "?" ở góc phải để xem lại hướng dẫn
          </Text>
        </View>
      </View>
    </Modal>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient colors={THEME.gradients.header} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.mainTitle}>Trí Nhớ</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>Điểm: {score}</Text>
              <Text style={styles.moves}>Lượt: {moves}</Text>
            </View>
          </View>
          <TouchableOpacity 
            ref={resetButtonRef}
            style={styles.resetButton}
            onPress={startNewGame}
          >
            <MaterialCommunityIcons 
              name="refresh" 
              size={24} 
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => setShowTutorial(true)}
          >
            <MaterialCommunityIcons name="help-circle" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        {renderHeader()}
        <View style={styles.gameContainer}>
          <View style={styles.grid}>
            {cards.map((card, index) => renderCard(card, index))}
          </View>
        </View>
        <Tutorial />
      </SafeAreaView>
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
    paddingTop: 45,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }], // Add initial rotation
    // Add animation properties
    transitionProperty: 'transform',
    transitionDuration: '0.3s',
  },
  headerTextContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: normalize(20),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: normalize(14),
    color: 'rgba(255,255,255,0.9)',
    lineHeight: normalize(20),
  },
  gameContainer: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardFlipped: {
    backgroundColor: '#F7FAFC',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  score: {
    fontSize: normalize(14),
    color: '#FFD700',
    fontWeight: 'bold',
    marginRight: 12,
  },
  moves: {
    fontSize: normalize(14),
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tutorialContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tutorialContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  tutorialTitle: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 20,
  },
  tutorialStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  tutorialText: {
    fontSize: normalize(16),
    color: THEME.text.dark,
    marginLeft: 15,
    flex: 1,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  tutorialNote: {
    fontSize: normalize(12),
    color: '#666',
    marginTop: 15,
    fontStyle: 'italic',
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: 4,
    position: 'relative',
  },
  cardFace: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cardFront: {
    transform: [{ rotateY: '180deg' }],
  },
  cardGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenFace: {
    backfaceVisibility: 'hidden',
    opacity: 0,
  },
});
