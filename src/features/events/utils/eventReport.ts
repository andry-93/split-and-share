import { formatDateTimeLocalized } from '@/shared/utils/date';
import { PaymentEntry, RawDebt, SimplifiedDebt } from '@/state/events/eventsSelectors';
import { EventItem } from '@/features/events/types/events';
import { formatMoneyFromMinor, sumMinorUnits, toMinorUnits } from '@/domain/finance/minorUnits';
import i18n from '@/shared/i18n';

type BuildEventReportHtmlInput = {
  appName: string;
  event: EventItem;
  currencyCode: string;
  locale?: string;
  debtsMode: 'simplified' | 'detailed';
  detailedDebts: RawDebt[];
  simplifiedDebts: SimplifiedDebt[];
  payments: PaymentEntry[];
  poolBalanceMap: Map<string, number>;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildEventReportHtml({
  appName,
  event,
  currencyCode,
  locale,
  debtsMode,
  detailedDebts,
  simplifiedDebts,
  payments,
  poolBalanceMap,
}: BuildEventReportHtmlInput) {
  const totalAmountMinor = sumMinorUnits(event.expenses.map((expense) => expense.amountMinor));
  
  const participantById = new Map(event.participants.map((participant) => [participant.id, participant.name]));
  (event.pools ?? []).forEach(pool => participantById.set(pool.id, pool.name));

  const expensesRows =
    event.expenses.length === 0
      ? `<tr><td colspan="4" class="muted">${escapeHtml(i18n.t('events.report.tableNoExpenses'))}</td></tr>`
      : event.expenses
          .map(
            (expense) => `
            <tr>
              <td>${escapeHtml(expense.title)}</td>
              <td>${formatMoneyFromMinor(currencyCode, expense.amountMinor, locale)}</td>
              <td>${escapeHtml(expense.paidBy)}</td>
              <td>${formatDateTimeLocalized(expense.updatedAt, locale)}</td>
            </tr>
          `,
          )
          .join('');

  const detailedRows =
    detailedDebts.length === 0
      ? `<tr><td colspan="3" class="muted">${escapeHtml(i18n.t('events.report.tableNoDetailedBalances'))}</td></tr>`
      : detailedDebts
          .map(
            (debt) => `
            <tr>
              <td>${escapeHtml(debt.from.name)} → ${escapeHtml(debt.to.name)}</td>
              <td>${formatMoneyFromMinor(currencyCode, debt.amountMinor, locale)}</td>
              <td>${escapeHtml(i18n.t('settings.detailed'))}</td>
            </tr>
          `,
          )
          .join('');

  const simplifiedRows =
    simplifiedDebts.length === 0
      ? `<tr><td colspan="2" class="muted">${escapeHtml(i18n.t('events.report.tableNoSimplifiedBalances'))}</td></tr>`
      : simplifiedDebts
          .map(
            (debt) => `
            <tr>
              <td>${escapeHtml(debt.from.name)} → ${escapeHtml(debt.to.name)}</td>
              <td>${formatMoneyFromMinor(currencyCode, debt.amountMinor, locale)}</td>
            </tr>
          `,
          )
          .join('');

  const selectedDebtsRows = debtsMode === 'detailed' ? detailedRows : simplifiedRows;
  const selectedDebtsHeader =
    debtsMode === 'detailed'
      ? `
        <tr>
          <th>${escapeHtml(i18n.t('events.report.transfer'))}</th>
          <th>${escapeHtml(i18n.t('events.report.amount'))}</th>
          <th>${escapeHtml(i18n.t('events.report.type'))}</th>
        </tr>
      `
      : `
        <tr>
          <th>${escapeHtml(i18n.t('events.report.transfer'))}</th>
          <th>${escapeHtml(i18n.t('events.report.amount'))}</th>
        </tr>
      `;
  const selectedDebtsTitle =
    debtsMode === 'detailed' ? i18n.t('events.report.detailedBalances') : i18n.t('events.report.simplifiedBalances');

  const paymentRows =
    payments.length === 0
      ? `<tr><td colspan="4" class="muted">${escapeHtml(i18n.t('events.report.tableNoPaidTransfers'))}</td></tr>`
      : payments
          .map(
            (payment) => `
            <tr>
              <td>${escapeHtml(participantById.get(payment.fromId) ?? payment.fromId)} → ${escapeHtml(participantById.get(payment.toId) ?? payment.toId)}</td>
              <td>${formatMoneyFromMinor(currencyCode, payment.amountMinor, locale)}</td>
              <td>${escapeHtml(i18n.t(`settings.${payment.source}`))}</td>
              <td>${formatDateTimeLocalized(payment.createdAt, locale)}</td>
            </tr>
          `,
          )
          .join('');

  const pools = event.pools ?? [];
  const poolRows =
    pools.length === 0
      ? `<tr><td colspan="2" class="muted">${escapeHtml(i18n.t('events.report.tableNoPools'))}</td></tr>`
      : pools
          .map((pool) => {
            const rawContributions = payments.filter((p) => p.toId === pool.id);
            const merged = new Map<string, number>();
            for (const p of rawContributions) {
              merged.set(p.fromId, (merged.get(p.fromId) ?? 0) + p.amountMinor);
            }
            
            const contributionsList = Array.from(merged.entries()).map(([fromId, amount]) => {
              const name = participantById.get(fromId) ?? fromId;
              return `<li style="margin-bottom: 4px;">${escapeHtml(name)}: <span style="font-weight: 500; margin-left: 6px;">${formatMoneyFromMinor(currencyCode, amount, locale)}</span></li>`;
            }).join('');
            
            const contributorsHtml = contributionsList.length > 0 
                ? `<ul style="margin: 8px 0 0; padding-left: 20px; color: #4B5563; font-size: 15px;">${contributionsList}</ul>` 
                : `<div style="margin-top: 6px; color: #9CA3AF; font-size: 14px;">${escapeHtml(i18n.t('events.pools.noContributors'))}</div>`;

            return `
            <tr>
              <td style="vertical-align: top;">
                <div style="font-weight: 600; font-size: 16px;">${escapeHtml(pool.name)}</div>
                ${contributorsHtml}
              </td>
              <td style="color: ${(poolBalanceMap.get(pool.id) ?? 0) >= 0 ? '#16A34A' : '#DC2626'}; vertical-align: top; padding-top: 13px; font-weight: 600; font-size: 16px;">
                ${formatMoneyFromMinor(currencyCode, toMinorUnits(poolBalanceMap.get(pool.id) ?? 0), locale)}
              </td>
            </tr>
          `;
          })
          .join('');

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 24px; color: #111827; font-size: 16px; line-height: 1.45; }
      .app {
        display: inline-block;
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 10px;
        padding: 10px 14px;
        border-radius: 10px;
        background: #1D4ED8;
        color: #F4FAFC;
      }
      .title { font-size: 30px; font-weight: 700; margin: 0 0 10px; }
      .sub { color: #4B5563; margin: 0 0 20px; font-size: 16px; }
      .summary { display: flex; gap: 16px; margin-bottom: 20px; }
      .card { border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 12px; min-width: 130px; }
      .label { color: #6B7280; font-size: 14px; margin-bottom: 4px; }
      .value { font-size: 22px; font-weight: 700; }
      h2 { margin-top: 24px; margin-bottom: 10px; font-size: 22px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 12px 8px; border-bottom: 1px solid #E5E7EB; font-size: 16px; }
      th { color: #4B5563; font-weight: 600; font-size: 15px; }
      .muted { color: #6B7280; }
    </style>
  </head>
  <body>
    <div class="app">${escapeHtml(appName)}</div>
    <h1 class="title">${escapeHtml(event.name)}</h1>
    <p class="sub">${escapeHtml(i18n.t('events.report.eventReportGenerated', { date: formatDateTimeLocalized(new Date().toISOString(), locale) }))}</p>

    <div class="summary">
      <div class="card">
        <div class="label">${escapeHtml(i18n.t('common.currency'))}</div>
        <div class="value">${escapeHtml(currencyCode)}</div>
      </div>
      <div class="card">
        <div class="label">${escapeHtml(i18n.t('events.report.participants'))}</div>
        <div class="value">${event.participants.length}</div>
      </div>
      <div class="card">
        <div class="label">${escapeHtml(i18n.t('events.report.totalExpenses'))}</div>
        <div class="value">${formatMoneyFromMinor(currencyCode, totalAmountMinor, locale)}</div>
      </div>
    </div>

    <h2>${escapeHtml(i18n.t('events.report.participants'))}</h2>
    <table>
      <thead>
        <tr>
          <th>${escapeHtml(i18n.t('events.report.name'))}</th>
          <th>${escapeHtml(i18n.t('events.report.phone'))}</th>
          <th>${escapeHtml(i18n.t('events.report.email'))}</th>
        </tr>
      </thead>
      <tbody>
        ${event.participants
          .map(
            (participant) => `
          <tr>
            <td>${escapeHtml(participant.name)}</td>
            <td>${escapeHtml(participant.phone ?? '—')}</td>
            <td>${escapeHtml(participant.email ?? '—')}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>

    ${pools.length > 0 ? `
    <h2>${escapeHtml(i18n.t('events.report.pools'))}</h2>
    <table>
      <thead>
        <tr>
          <th>${escapeHtml(i18n.t('events.report.poolName'))}</th>
          <th>${escapeHtml(i18n.t('events.report.balance'))}</th>
        </tr>
      </thead>
      <tbody>${poolRows}</tbody>
    </table>
    ` : ''}

    <h2>${escapeHtml(i18n.t('events.report.expenses'))}</h2>
    <table>
      <thead>
        <tr>
          <th>${escapeHtml(i18n.t('common.title'))}</th>
          <th>${escapeHtml(i18n.t('events.report.amount'))}</th>
          <th>${escapeHtml(i18n.t('events.report.paidBy'))}</th>
          <th>${escapeHtml(i18n.t('events.report.updated'))}</th>
        </tr>
      </thead>
      <tbody>${expensesRows}</tbody>
    </table>

    <h2>${selectedDebtsTitle}</h2>
    <table>
      <thead>
        ${selectedDebtsHeader}
      </thead>
      <tbody>${selectedDebtsRows}</tbody>
    </table>

    <h2>${escapeHtml(i18n.t('events.report.paidTransfers'))}</h2>
    <table>
      <thead>
        <tr>
          <th>${escapeHtml(i18n.t('events.report.transfer'))}</th>
          <th>${escapeHtml(i18n.t('events.report.amount'))}</th>
          <th>${escapeHtml(i18n.t('events.report.source'))}</th>
          <th>${escapeHtml(i18n.t('events.report.paidAt'))}</th>
        </tr>
      </thead>
      <tbody>${paymentRows}</tbody>
    </table>
  </body>
</html>
  `;
}
