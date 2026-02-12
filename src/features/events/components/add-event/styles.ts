import { StyleSheet } from 'react-native';

export const addEventStyles = StyleSheet.create({
  form: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  fieldLabel: {
    marginBottom: 8,
  },
  inputContainer: {
    minHeight: 56,
    marginBottom: 16,
    justifyContent: 'center',
  },
  inputField: {
    height: 52,
  },
  inputContent: {
    paddingHorizontal: 12,
  },
  multilineContainer: {
    minHeight: 96,
    marginBottom: 16,
  },
  multilineField: {
    minHeight: 92,
  },
  selectField: {
    minHeight: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldContainer: {
    marginBottom: 16,
  },
  dateIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hiddenUnderline: {
    display: 'none',
  },
  transparentInput: {
    backgroundColor: 'transparent',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sheetTitle: {
    marginBottom: 12,
  },
  iosPickerModal: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  iosPickerTitle: {
    textAlign: 'center',
  },
});
