export function getListPressedBackground(isDark: boolean): string {
  // Use higher opacity and the new primary #1D4ED8 (29, 78, 216) so the "Me" item doesn't blend with the tinted surface
  return isDark ? 'rgba(147, 180, 255, 0.15)' : 'rgba(29, 78, 216, 0.14)';
}
