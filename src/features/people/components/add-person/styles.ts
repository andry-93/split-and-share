import { StyleSheet } from 'react-native';

export const addPersonStyles = StyleSheet.create({
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
});
