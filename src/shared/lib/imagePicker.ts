import * as ImagePicker from 'expo-image-picker';

export const pickImage = async (): Promise<string | undefined> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled) return;

  return result.assets[0].uri;
};
