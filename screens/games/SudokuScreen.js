import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Text, 
  Alert,
  Dimensions,
  Animated,
  Modal,
  Vibration,
  ScrollView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normalize } from '../../utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';

// Điều chỉnh lại các kích thước
const { width } = Dimensions.get('window');
const BOARD_SIZE = width * 0.85; // Giảm kích thước bảng xuống
const CELL_SIZE = BOARD_SIZE / 9;
const BUTTON_SIZE = width / 9; // Giảm kích thước nút số

const THEME = {
  primary: '#2F855A',
  secondary: '#38A169',
  danger: '#E53E3E',
  warning: '#DD6B20',
  info: '#3182CE',
  border: '#CBD5E0',
  selected: '#E6FFFA',  // Màu nền nhạt hơn cho ô được chọn
  selectedBorder: '#9AE6B4', // Màu viền cho ô được chọn
  note: '#718096',
  gradients: {
    header: ['#1A4731', '#276749', '#2D8156'],
    success: ['#38A169', '#48BB78'],
  },
  buttonGradient: ['#38A169', '#2F855A'], // Gradient cho các nút số
};

const DIFFICULTIES = {
  EASY: { name: 'Dễ', emptyCells: 30 },
  MEDIUM: { name: 'Trung bình', emptyCells: 40 },
  HARD: { name: 'Khó', emptyCells: 50 }
};

const generateSudokuPuzzle = (emptyCells) => {
  // First generate a solved puzzle
  const solvedPuzzle = generateSolvedPuzzle();
  
  // Then remove numbers to create the puzzle
  return removeNumbers(solvedPuzzle, emptyCells);
};

const generateSolvedPuzzle = () => {
  const puzzle = Array(9).fill().map(() => Array(9).fill(0));
  fillPuzzle(puzzle);
  return puzzle;
};

const fillPuzzle = (puzzle) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(puzzle, row, col, num)) {
            puzzle[row][col] = num;
            if (fillPuzzle(puzzle)) {
              return true;
            }
            puzzle[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const removeNumbers = (puzzle, emptyCells) => {
  const result = puzzle.map(row => [...row]);
  let cellsToRemove = emptyCells;
  
  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (result[row][col] !== 0) {
      result[row][col] = 0;
      cellsToRemove--;
    }
  }
  
  return result;
};

const isValidPlacement = (board, row, col, num) => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row/3) * 3;
  const boxCol = Math.floor(col/3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
};

const getSolution = (board) => {
  const solution = board.map(row => [...row]);
  fillPuzzle(solution);
  return solution;
};

// Sửa lại hàm isValid
const isValid = (board, row, col, num) => {
  if (num === 0) return true; // Cho phép xóa số (đặt số 0)

  // Kiểm tra hàng
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === num) {
      return false;
    }
  }

  // Kiểm tra cột
  for (let y = 0; y < 9; y++) {
    if (y !== row && board[y][col] === num) {
      return false;
    }
  }

  // Kiểm tra ô 3x3
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentRow = boxStartRow + i;
      const currentCol = boxStartCol + j;
      if (currentRow !== row && currentCol !== col && 
          board[currentRow][currentCol] === num) {
        return false;
      }
    }
  }

  return true;
};

// Thêm hàm mới để kiểm tra chi tiết lỗi trùng số
const checkDuplicates = (board, row, col, num) => {
  const errors = [];
  
  // Kiểm tra hàng
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === num) {
      errors.push({
        type: 'row',
        position: { row, col: x }
      });
    }
  }

  // Kiểm tra cột
  for (let y = 0; y < 9; y++) {
    if (y !== row && board[y][col] === num) {
      errors.push({
        type: 'column',
        position: { row: y, col }
      });
    }
  }

  // Kiểm tra ô 3x3
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentRow = boxStartRow + i;
      const currentCol = boxStartCol + j;
      if (currentRow !== row && currentCol !== col && 
          board[currentRow][currentCol] === num) {
        errors.push({
          type: 'box',
          position: { row: currentRow, col: currentCol }
        });
      }
    }
  }

  return errors;
};

const SudokuScreen = ({ navigation }) => {
  // State management
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [noteMode, setNoteMode] = useState(false);
  const [notes, setNotes] = useState(Array(9).fill().map(() => Array(9).fill(new Set())));
  const [gameTime, setGameTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES.EASY);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [score, setScore] = useState(0);
  const [highlightedNumber, setHighlightedNumber] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [statistics, setStatistics] = useState({
    gamesPlayed: 0,
    bestTime: null,
    averageTime: 0,
  });
  const [errorCells, setErrorCells] = useState([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Timer effect
  useEffect(() => {
    let interval;
    if (!isPaused) {
      interval = setInterval(() => {
        setGameTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // Load saved game and statistics on mount
  useEffect(() => {
    loadGame();
    loadStatistics();
  }, []);

  const loadGame = async () => {
    try {
      const savedGame = await AsyncStorage.getItem('@sudoku_game'); // Changed from .get to .getItem
      if (savedGame) {
        const { board, notes, time, difficulty } = JSON.parse(savedGame);
        setBoard(board);
        setNotes(notes);
        setGameTime(time);
        setDifficulty(difficulty);
      } else {
        generateNewGame(difficulty);
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  const saveGame = async () => {
    try {
      const gameData = {
        board,
        notes,
        time: gameTime,
        difficulty
      };
      await AsyncStorage.setItem('@sudoku_game', JSON.stringify(gameData)); // Changed from .set to .setItem
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await AsyncStorage.getItem('@sudoku_stats'); // Changed from .get to .getItem
      if (stats) {
        setStatistics(JSON.parse(stats));
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const updateStatistics = async (time) => {
    const newStats = {
      gamesPlayed: statistics.gamesPlayed + 1,
      bestTime: statistics.bestTime ? Math.min(statistics.bestTime, time) : time,
      averageTime: Math.round(((statistics.averageTime * statistics.gamesPlayed) + time) / (statistics.gamesPlayed + 1))
    };
    setStatistics(newStats);
    try {
      await AsyncStorage.setItem('@sudoku_stats', JSON.stringify(newStats)); // Changed from .set to .setItem
    } catch (error) {
      console.error('Error saving statistics:', error);
    }
  };

  const generateNewGame = (difficulty) => {
    // Implementation of Sudoku generator would go here
    // For now, we'll use a placeholder implementation
    const newBoard = generateSudokuPuzzle(difficulty.emptyCells);
    setBoard(newBoard);
    setNotes(Array(9).fill().map(() => Array(9).fill(new Set())));
    setGameTime(0);
    setHintsRemaining(3);
    setScore(1000);
  };

  const handleCellPress = (row, col) => {
    setSelectedCell({ row, col });
    if (board[row][col] !== 0) {
      setHighlightedNumber(board[row][col]);
    }
    Vibration.vibrate(10); // Haptic feedback
  };

  const handleNumberPress = (number) => {
    if (!selectedCell || isPaused) return;

    const { row, col } = selectedCell;
    
    if (noteMode) {
      handleNoteInput(row, col, number);
    } else {
      handleNumberInput(row, col, number);
    }
  };

  const handleNoteInput = (row, col, number) => {
    const newNotes = [...notes];
    const currentNotes = new Set(notes[row][col]);
    
    if (currentNotes.has(number)) {
      currentNotes.delete(number);
    } else {
      currentNotes.add(number);
    }
    
    newNotes[row][col] = currentNotes;
    setNotes(newNotes);
  };

  // Sửa lại hàm handleNumberInput
  const handleNumberInput = (row, col, number) => {
    if (!selectedCell) return;
    
    if (number === 0) {
      // Cho phép xóa số
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = number;
      setBoard(newBoard);
      return;
    }

    // Kiểm tra số trùng
    const duplicates = checkDuplicates(board, row, col, number);
    
    if (duplicates.length === 0) {
      // Không có số trùng, cho phép đặt số
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = number;
      setBoard(newBoard);
      setScore(prevScore => Math.max(0, prevScore + 10));
      
      // Xóa ghi chú khi đặt số
      const newNotes = [...notes];
      newNotes[row][col] = new Set();
      setNotes(newNotes);

      checkWin(newBoard);
    } else {
      // Có số trùng, hiển thị animation lỗi
      setScore(prevScore => Math.max(0, prevScore - 50));
      
      // Hiển thị các ô bị trùng
      const errorPositions = duplicates.map(error => error.position);
      setErrorCells(errorPositions);

      // Hiệu ứng rung và đổi màu
      showError();

      // Tự động xóa highlight lỗi sau 1 giây
      setTimeout(() => {
        setErrorCells([]);
      }, 1000);
    }
  };

  const useHint = () => {
    if (hintsRemaining > 0 && selectedCell) {
      const { row, col } = selectedCell;
      const solution = getSolution(board);
      if (solution[row][col] !== board[row][col]) {
        const newBoard = [...board];
        newBoard[row][col] = solution[row][col];
        setBoard(newBoard);
        setHintsRemaining(prev => prev - 1);
        setScore(prevScore => Math.max(0, prevScore - 100));
      }
    }
  };

  const showError = () => {
    Vibration.vibrate([0, 500, 200, 500]);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };

  const showSuccess = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true
      })
    ]).start();
  };

  // Thêm hàm checkWin
  const checkWin = (currentBoard) => {
    // Kiểm tra xem có ô trống không
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (currentBoard[i][j] === 0) {
          return false;
        }
      }
    }
    
    // Kiểm tra tính hợp lệ của toàn bộ bảng
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const num = currentBoard[i][j];
        currentBoard[i][j] = 0;
        if (!isValid(currentBoard, i, j, num)) {
          currentBoard[i][j] = num;
          return false;
        }
        currentBoard[i][j] = num;
      }
    }

    // Nếu qua hết các kiểm tra, người chơi đã thắng
    Alert.alert(
      'Chúc mừng!',
      'Bạn đã hoàn thành trò chơi Sudoku!',
      [
        {
          text: 'Chơi lại',
          onPress: () => generateNewGame(difficulty)
        },
        {
          text: 'Thoát',
          onPress: () => navigation.goBack(),
          style: 'cancel'
        }
      ]
    );
    return true;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={THEME.gradients.header}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sudoku</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsPaused(true)}
        >
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="clock-outline" size={20} color={THEME.primary} />
          <Text style={styles.infoText}>{formatTime(gameTime)}</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="lightbulb-outline" size={20} color={THEME.primary} />
          <Text style={styles.infoText}>{hintsRemaining}</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="star-outline" size={20} color={THEME.primary} />
          <Text style={styles.infoText}>{score}</Text>
        </View>
      </View>

      {/* Sudoku Board */}
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.boardContainer}>
          <View style={styles.board}>
            {board.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => (
                  <TouchableOpacity 
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex && styles.selectedCell,
                      cell === highlightedNumber && styles.highlightedCell,
                      errorCells.some(err => err.row === rowIndex && err.col === colIndex) && styles.errorCell,
                      (Math.floor(rowIndex/3) + Math.floor(colIndex/3)) % 2 === 0 ? styles.shadedCell : null,
                      rowIndex % 3 === 2 && styles.borderBottom,
                      colIndex % 3 === 2 && styles.borderRight,
                    ]}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                  >
                    {cell !== 0 ? (
                      <Text style={styles.cellText}>{cell}</Text>
                    ) : notes[rowIndex][colIndex].size > 0 ? (
                      <View style={styles.notesContainer}>
                        {[1,2,3,4,5,6,7,8,9].map(num => (
                          <Text key={num} style={styles.noteText}>
                            {notes[rowIndex][colIndex].has(num) ? num : ''}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Number Pad */}
      <View style={styles.controls}>
        <View style={styles.numberPad}>
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <TouchableOpacity 
              key={num}
              style={styles.numberButton}
              onPress={() => handleNumberPress(num)}
            >
              <Text style={styles.numberText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, noteMode && styles.actionButtonActive]}
            onPress={() => setNoteMode(!noteMode)}
          >
            <MaterialCommunityIcons 
              name="pencil" 
              size={28} 
              color={noteMode ? THEME.primary : THEME.border}
              style={styles.actionButtonIcon}
            />
            <Text style={styles.actionButtonText}>Ghi chú</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={useHint}
          >
            <MaterialCommunityIcons 
              name="lightbulb-outline" 
              size={28} 
              color={hintsRemaining > 0 ? THEME.primary : THEME.border}
              style={styles.actionButtonIcon}
            />
            <Text style={styles.actionButtonText}>Gợi ý ({hintsRemaining})</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleNumberPress(0)}
          >
            <MaterialCommunityIcons 
              name="eraser" 
              size={28} 
              color={THEME.danger}
              style={styles.actionButtonIcon}
            />
            <Text style={styles.actionButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pause Modal */}
      <Modal
        visible={isPaused}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Paused</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setIsPaused(false)}
            >
              <Text style={styles.modalButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => generateNewGame(difficulty)}
            >
              <Text style={styles.modalButtonText}>New Game</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonDanger]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextDanger]}>Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 34 : 0, // Thêm padding cho iPhone có notch
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuButton: {
    padding: 8,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#F7FAFC',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: normalize(16),
    color: THEME.primary,
    fontWeight: '600',
  },
  boardContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    flex: 1,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    transition: 'all 0.3s ease', // Thêm animation mượt
  },
  selectedCell: {
    backgroundColor: THEME.selected,
    borderWidth: 2,
    borderColor: THEME.selectedBorder,
    transform: [{ scale: 1.02 }], // Hiệu ứng phóng to nhẹ
  },
  highlightedCell: {
    backgroundColor: THEME.selected + '80',
  },
  shadedCell: {
    backgroundColor: '#F7FAFC',
  },
  borderBottom: {
    borderBottomWidth: 2,
    borderBottomColor: THEME.primary,
  },
  borderRight: {
    borderRightWidth: 2,
    borderRightColor: THEME.primary,
  },
  cellText: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: THEME.primary,
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    padding: 2,
  },
  noteText: {
    width: '33.33%',
    height: '33.33%',
    fontSize: normalize(7),
    textAlign: 'center',
    color: THEME.note,
  },
  controls: {
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  numberButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    margin: 3,
    borderRadius: 8,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  numberText: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  actionButton: {
    width: width / 6,
    height: width / 6,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  actionButtonActive: {
    backgroundColor: THEME.selected,
    borderWidth: 2,
    borderColor: THEME.selectedBorder,
  },
  actionButtonIcon: {
    marginBottom: 2,
  },
  actionButtonText: {
    fontSize: normalize(10),
    color: THEME.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: normalize(24),
    fontWeight: '600',
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: THEME.primary,
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtonDanger: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.danger,
  },
  modalButtonTextDanger: {
    color: THEME.danger,
  },
  errorCell: {
    backgroundColor: '#FED7D7',
    borderColor: THEME.danger,
    borderWidth: 2,
    transform: [{ scale: 1.05 }], // Làm nổi bật ô lỗi
  },
});

export default SudokuScreen;
