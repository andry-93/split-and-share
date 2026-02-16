import { EventItem } from '@/features/events/types/events';
import { formatCurrencyAmount } from '@/shared/utils/currency';
import { PaymentEntry, RawDebt, SimplifiedDebt } from '@/state/events/eventsSelectors';

type BuildEventReportHtmlInput = {
  appName: string;
  event: EventItem;
  currencyCode: string;
  detailedDebts: RawDebt[];
  simplifiedDebts: SimplifiedDebt[];
  payments: PaymentEntry[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

export function buildEventReportHtml({
  appName,
  event,
  currencyCode,
  detailedDebts,
  simplifiedDebts,
  payments,
}: BuildEventReportHtmlInput) {
  const totalAmount = event.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const participantById = new Map(event.participants.map((participant) => [participant.id, participant.name]));

  const expensesRows =
    event.expenses.length === 0
      ? '<tr><td colspan="4" class="muted">No expenses</td></tr>'
      : event.expenses
          .map(
            (expense) => `
            <tr>
              <td>${escapeHtml(expense.title)}</td>
              <td>${formatCurrencyAmount(currencyCode, expense.amount)}</td>
              <td>${escapeHtml(expense.paidBy)}</td>
              <td>${formatDate(expense.updatedAt)}</td>
            </tr>
          `,
          )
          .join('');

  const detailedRows =
    detailedDebts.length === 0
      ? '<tr><td colspan="3" class="muted">No detailed debts</td></tr>'
      : detailedDebts
          .map(
            (debt) => `
            <tr>
              <td>${escapeHtml(debt.from.name)} → ${escapeHtml(debt.to.name)}</td>
              <td>${formatCurrencyAmount(currencyCode, debt.amount)}</td>
              <td>Detailed</td>
            </tr>
          `,
          )
          .join('');

  const simplifiedRows =
    simplifiedDebts.length === 0
      ? '<tr><td colspan="2" class="muted">No simplified debts</td></tr>'
      : simplifiedDebts
          .map(
            (debt) => `
            <tr>
              <td>${escapeHtml(debt.from.name)} → ${escapeHtml(debt.to.name)}</td>
              <td>${formatCurrencyAmount(currencyCode, debt.amount)}</td>
            </tr>
          `,
          )
          .join('');

  const paymentRows =
    payments.length === 0
      ? '<tr><td colspan="4" class="muted">No paid transfers</td></tr>'
      : payments
          .map(
            (payment) => `
            <tr>
              <td>${escapeHtml(participantById.get(payment.fromId) ?? payment.fromId)} → ${escapeHtml(participantById.get(payment.toId) ?? payment.toId)}</td>
              <td>${formatCurrencyAmount(currencyCode, payment.amount)}</td>
              <td>${escapeHtml(payment.source)}</td>
              <td>${formatDate(payment.createdAt)}</td>
            </tr>
          `,
          )
          .join('');

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 24px; color: #111827; }
      .app {
        display: inline-block;
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 10px;
        padding: 8px 12px;
        border-radius: 10px;
        background: #2563FF;
        color: #FFFFFF;
      }
      .title { font-size: 26px; font-weight: 700; margin: 0 0 8px; }
      .sub { color: #4B5563; margin: 0 0 20px; }
      .summary { display: flex; gap: 16px; margin-bottom: 20px; }
      .card { border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 12px; min-width: 130px; }
      .label { color: #6B7280; font-size: 12px; margin-bottom: 4px; }
      .value { font-size: 18px; font-weight: 700; }
      h2 { margin-top: 22px; margin-bottom: 8px; font-size: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 8px; border-bottom: 1px solid #E5E7EB; font-size: 13px; }
      th { color: #4B5563; font-weight: 600; }
      .muted { color: #6B7280; }
    </style>
  </head>
  <body>
    <div class="app">${escapeHtml(appName)}</div>
    <h1 class="title">${escapeHtml(event.name)}</h1>
    <p class="sub">Event report generated ${formatDate(new Date().toISOString())}</p>

    <div class="summary">
      <div class="card">
        <div class="label">Currency</div>
        <div class="value">${escapeHtml(currencyCode)}</div>
      </div>
      <div class="card">
        <div class="label">Participants</div>
        <div class="value">${event.participants.length}</div>
      </div>
      <div class="card">
        <div class="label">Total Expenses</div>
        <div class="value">${formatCurrencyAmount(currencyCode, totalAmount)}</div>
      </div>
    </div>

    <h2>Participants</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
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

    <h2>Expenses</h2>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Amount</th>
          <th>Paid by</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>${expensesRows}</tbody>
    </table>

    <h2>Detailed Debts</h2>
    <table>
      <thead>
        <tr>
          <th>Transfer</th>
          <th>Amount</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>${detailedRows}</tbody>
    </table>

    <h2>Simplified Debts</h2>
    <table>
      <thead>
        <tr>
          <th>Transfer</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>${simplifiedRows}</tbody>
    </table>

    <h2>Paid Transfers</h2>
    <table>
      <thead>
        <tr>
          <th>Transfer</th>
          <th>Amount</th>
          <th>Source</th>
          <th>Paid at</th>
        </tr>
      </thead>
      <tbody>${paymentRows}</tbody>
    </table>
  </body>
</html>
  `;
}
