import { Audio, AVPlaybackStatus } from 'expo-av';

let soundObj: Audio.Sound | null = null;

const unloadIfNeeded = async () => {
  try {
    if (soundObj) {
      await soundObj.unloadAsync();
      soundObj = null;
    }
  } catch {}
};

export const playAsset = async (asset: number) => {
  await unloadIfNeeded();
  const { sound } = await Audio.Sound.createAsync(asset);
  soundObj = sound;
  await soundObj.playAsync();
  soundObj.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
    if (!status.isLoaded || (status.isLoaded && status.didJustFinish)) {
      unloadIfNeeded();
    }
  });
};

export const playBeep = async () => playAsset(require('../assets/sounds/beep.mp3'));
export const playRaceStart = async () => playAsset(require('../assets/sounds/race-start.mp3'));

