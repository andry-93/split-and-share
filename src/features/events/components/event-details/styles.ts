import { StyleSheet } from 'react-native';

export const eventDetailsStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 16,
  },
  summaryCard: {
    marginTop: 0,
    marginHorizontal: -16,
    marginBottom: 0,
    borderRadius: 0,
    borderWidth: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
  },
  topTabBar: {
    marginHorizontal: -16,
    marginBottom: 0,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topTabItem: {
    width: '33.3333%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  topTabLabel: {
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
  },
  debtsContent: {
    flex: 1,
    paddingTop: 12,
  },
  debtsHeaderRow: {
    minHeight: 44,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  debtsHeaderLabel: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  debtsSharedPaidHint: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  expensesListContainer: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  peopleSectionSpacing: {
    paddingTop: 12,
  },
  listEmpty: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  expenseLeading: {
    marginRight: 12,
  },
  expenseIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    marginRight: 12,
  },
  amount: {
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  balancePill: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  rawListWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  debtsListWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  simplifiedHint: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  rawListContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
  },
  rawListContainerHeight: {
    overflow: 'hidden',
  },
  rawList: {
    flexGrow: 0,
  },
  rawDebtRow: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rawDebtText: {
    flex: 1,
    marginRight: 12,
  },
  simplifiedDebtRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  simplifiedAmount: {
    marginBottom: 4,
  },
  markPaidButton: {
    minHeight: 28,
    marginRight: -10,
  },
  markPaidButtonContent: {
    minHeight: 28,
    paddingHorizontal: 6,
  },
  markPaidButtonLabel: {
    marginVertical: 0,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
});

