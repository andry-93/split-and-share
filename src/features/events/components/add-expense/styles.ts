import { StyleSheet } from 'react-native';

export const addExpenseStyles = StyleSheet.create({
  form: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  formContentGrow: {
    flexGrow: 1,
  },
  amountInputContainer: {
    minHeight: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountCurrency: {
    marginRight: 8,
  },
  amountInlineInput: {
    flex: 1,
    height: 52,
  },
  amountInlineInputContent: {
    fontSize: 36,
    paddingHorizontal: 0,
  },
  hiddenUnderline: {
    display: 'none',
  },
  transparentInput: {
    backgroundColor: 'transparent',
  },
  titleInputContainer: {
    minHeight: 56,
    paddingHorizontal: 0,
    justifyContent: 'center',
    marginBottom: 16,
  },
  titleInlineInput: {
    height: 52,
  },
  titleInlineInputContent: {
    paddingHorizontal: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    flex: 1,
    minHeight: 72,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  selectField: {
    minHeight: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsCard: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  participantRow: {
    minHeight: 52,
    paddingLeft: 12,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantLabelArea: {
    flex: 1,
    paddingVertical: 12,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
