// import { Platform } from 'react-native';
// import * as Permissions from 'expo-permissions';

// /**
//  * Request necessary permissions for voice recognition
//  */
// export const requestPermissions = async () => {
//   try {
//     // Different permission requests for iOS and Android
//     if (Platform.OS === 'ios') {
//       const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
//       return status === 'granted';
//     } else {
//       // Android needs microphone permission
//       const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
//       return status === 'granted';
//     }
//   } catch (error) {
//     console.error('Error requesting permissions:', error);
//     return false;
//   }
// };
