export function getInitialsAvatarColors(isDark: boolean) {
  if (isDark) {
    return {
      backgroundColor: '#0F2A66',
      labelColor: '#3B82F6',
    };
  }

  return {
    backgroundColor: '#D6E5FF',
    labelColor: '#2563FF',
  };
}
