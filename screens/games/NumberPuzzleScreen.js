import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions, 
  Alert, 
  Animated,
  Modal 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { normalize } from '../../utils/responsive';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const BOARD_PADDING = 15;
const GRID_GAP = 10;
// Recalculate cell size accounting for padding and gaps
const CELL_SIZE = (width - (BOARD_PADDING * 2) - (GRID_GAP * (GRID_SIZE - 1))) / GRID_SIZE;
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, null];

const THEME = {
  primary: '#4C51BF',
  secondary: '#6366F1',
  accent: '#F6E05E',
  text: {
    primary: '#FFFFFF',
    secondary: '#4A5568',
    dark: '#1A202C'
  },
  gradients: {
    header: ['#4C51BF', '#5A67D8', '#667EEA'],
    cell: ['#FFFFFF', '#EDF2F7'],
    emptyCell: ['rgba(74, 85, 104, 0.1)', 'rgba(74, 85, 104, 0.05)'],
    button: ['#667EEA', '#4C51BF'],
    board: ['#2D3748', '#1A202C']
  }
};

export default function NumberPuzzleScreen({ navigation }) {
  const [board, setBoard] = useState([]);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState(Infinity);
  const [isWin, setIsWin] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const cellAnims = useRef([...Array(9)].map(() => new Animated.Value(1))).current;
  const moveAnim = useRef(new Animated.Value(0)).current;

  const shuffleBoard = () => {
    let numbers = [...NUMBERS];
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setBoard(numbers);
    setMoves(0);
    setIsWin(false);
  };

  useEffect(() => {
    shuffleBoard();
  }, []);

  const animateMove = (from, to) => {
    Animated.sequence([
      Animated.timing(cellAnims[from], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(cellAnims[from], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true
      })
    ]).start();
  };

  const animateBestMove = () => {
    Animated.sequence([
      Animated.timing(moveAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  const checkWin = (newBoard) => {
    const win = newBoard.every((num, index) => {
      if (index === newBoard.length - 1) return num === null;
      return num === index + 1;
    });

    if (win) {
      setIsWin(true);
      if (moves < bestMoves) {
        setBestMoves(moves);
        animateBestMove();
      }
      setTimeout(() => {
        Alert.alert(
          "🎉 Xuất sắc! 🎉",
          `Bạn đã hoàn thành trong ${moves} bước!\n${moves < bestMoves ? '🏆 Kỷ lục mới!' : ''}`,
          [{ text: "Chơi lại", onPress: shuffleBoard }]
        );
      }, 500);
    }
    return win;
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
          <Text style={styles.tutorialTitle}>Cách chơi</Text>
          <View style={styles.tutorialStep}>
            <MaterialCommunityIcons name="gesture-tap" size={24} color={THEME.primary} />
            <Text style={styles.tutorialText}>
              Di chuyển các ô số để sắp xếp từ 1-8
            </Text>
          </View>
          <View style={styles.tutorialStep}>
            <MaterialCommunityIcons name="target" size={24} color={THEME.primary} />
            <Text style={styles.tutorialText}>
              Hoàn thành với ít bước nhất có thể
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setShowTutorial(false)}
          >
            <Text style={styles.startButtonText}>Bắt đầu chơi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleMove = (index) => {
    const emptyIndex = board.indexOf(null);
    const row = Math.floor(index / GRID_SIZE);
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyCol = emptyIndex % GRID_SIZE;

    if (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    ) {
      const newBoard = [...board];
      [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
      setBoard(newBoard);
      setMoves(moves + 1);
      animateMove(index, emptyIndex);

      if (checkWin(newBoard)) {
        setTimeout(() => {
          Alert.alert(
            "Chúc mừng!",
            `Bạn đã hoàn thành trong ${moves + 1} bước!`,
            [{ text: "Chơi lại", onPress: shuffleBoard }]
          );
        }, 300);
      }
    }
  };

  const renderCell = (number, index) => {
    const scale = cellAnims[index];
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    
    return (
      <TouchableOpacity
        key={index}
        onPress={() => !isWin && number && handleMove(index)}
        disabled={!number}
        style={[
          styles.cellWrapper,
          {
            left: col * (CELL_SIZE + GRID_GAP),
            top: row * (CELL_SIZE + GRID_GAP)
          }
        ]}
      >
        <Animated.View
          style={[
            styles.cell,
            !number && styles.emptyCell,
            { transform: [{ scale }] }
          ]}
        >
          {number ? (
            <LinearGradient
              colors={THEME.gradients.cell}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cellContent}
            >
              <Text style={styles.number}>{number}</Text>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={THEME.gradients.emptyCell}
              style={styles.cellContent}
            />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <LinearGradient colors={THEME.gradients.header} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.mainTitle}>Ghép Số</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="star" size={20} color={THEME.accent} />
                  <Text style={styles.statText}>Bước: {moves}</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="trophy" size={20} color={THEME.accent} />
                  <Text style={styles.statText}>
                    Kỷ lục: {bestMoves === Infinity ? '-' : bestMoves}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.gameContainer}>
          <View style={styles.boardContainer}>
            <LinearGradient
              colors={THEME.gradients.board}
              style={styles.board}
            >
              <View style={styles.grid}>
                {board.map((number, index) => renderCell(number, index))}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={shuffleBoard}
            >
              <LinearGradient
                colors={THEME.gradients.button}
                style={styles.buttonGradient}
              >
                <MaterialCommunityIcons name="refresh" size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Chơi lại</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setShowTutorial(true)}
            >
              <LinearGradient
                colors={THEME.gradients.button}
                style={styles.buttonGradient}
              >
                <MaterialCommunityIcons name="help-circle" size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Hướng dẫn</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontWeight: '600',
    marginLeft: 6,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  boardContainer: {
    padding: BOARD_PADDING,
    borderRadius: 25,
    backgroundColor: '#2D3748',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
  },
  board: {
    width: CELL_SIZE * GRID_SIZE + GRID_GAP * (GRID_SIZE - 1),
    height: CELL_SIZE * GRID_SIZE + GRID_GAP * (GRID_SIZE - 1),
    borderRadius: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  grid: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  cellWrapper: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  cell: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  number: {
    fontSize: normalize(36),
    fontWeight: '800',
    color: '#4C51BF',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  emptyCell: {
    opacity: 0.3,
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 30,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: normalize(18),
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
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
    color: THEME.text.dark,  // Sử dụng dark color
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
});
