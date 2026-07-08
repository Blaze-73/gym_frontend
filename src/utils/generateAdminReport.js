const LOGO_URL = `${window.location.origin}/alien-logo.png?v=3`;

const fmtMoney = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const table = (headers, rows) => {
  if (!rows?.length) {
    return '<p class="empty">No data for this section.</p>';
  }
  const head = headers.map((h) => `<th>${esc(h)}</th>`).join('');
  const body = rows.map((row) => {
    const cells = (Array.isArray(row) ? row : Object.values(row))
      .map((c) => `<td>${esc(c)}</td>`)
      .join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
};

const kpiGrid = (items) => `
  <div class="kpi-grid">
    ${items.map(({ label, value, hint }) => `
      <div class="kpi">
        <div class="kpi-label">${esc(label)}</div>
        <div class="kpi-value">${esc(value)}</div>
        ${hint ? `<div class="kpi-hint">${esc(hint)}</div>` : ''}
      </div>
    `).join('')}
  </div>
`;

const section = (title, subtitle, content) => `
  <section class="report-section">
    <h2>${esc(title)}</h2>
    ${subtitle ? `<p class="section-sub">${esc(subtitle)}</p>` : ''}
    ${content}
  </section>
`;

const buildTrendBars = (trends) => {
  const maxRev = Math.max(...trends.map((t) => t.revenue), 1);
  return `
    <div class="trend-chart">
      ${trends.map((t) => {
        const pct = Math.round((t.revenue / maxRev) * 100);
        return `
          <div class="trend-col">
            <div class="trend-bar-wrap"><div class="trend-bar" style="height:${Math.max(pct, 8)}%"></div></div>
            <div class="trend-rev">${fmtMoney(t.revenue)}</div>
            <div class="trend-month">${esc(t.month)}</div>
            <div class="trend-sub">${t.new_memberships} new</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
};

const REPORT_META = {
  full: {
    title: 'Operations Overview Report',
    subtitle: 'Complete performance snapshot for Alien Fitness',
  },
  members: {
    title: 'Members & Memberships Report',
    subtitle: 'Member growth, active plans, and renewals at risk',
  },
  revenue: {
    title: 'Revenue & Sales Report',
    subtitle: 'Membership revenue, store orders, and subscriptions',
  },
};

export function buildReportHtml(data, type = 'full') {
  const meta = REPORT_META[type] || REPORT_META.full;
  const generated = new Date(data.generated_at || Date.now()).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const s = data.stats || {};

  let body = '';

  if (type === 'full' || type === 'members') {
    body += section('Executive Summary', 'Key metrics as of report generation', kpiGrid([
      { label: 'Total Members', value: s.total_clients, hint: `${s.new_users_this_month} new this month` },
      { label: 'Active Memberships', value: s.active_memberships, hint: `${s.total_memberships} total records` },
      { label: 'Expiring (7 days)', value: s.expiring_soon, hint: 'Requires follow-up' },
      { label: 'Monthly Revenue', value: fmtMoney(s.monthly_revenue), hint: 'New memberships this month' },
    ]));

    if (type === 'full') {
      body += section('6-Month Trends', 'Membership sign-ups and plan revenue', buildTrendBars(data.trends || []));
    }

    body += section(
      'Recent Memberships',
      'Latest member enrollments',
      table(
        ['Member', 'Email', 'Plan', 'Status', 'Start', 'End'],
        (data.recent_memberships || []).map((r) => [r.member, r.email, r.plan, r.status, r.start_date, r.end_date]),
      ),
    );

    body += section(
      'Expiring Within 7 Days',
      'Members who may need renewal outreach',
      table(['Member', 'Plan', 'End date'], (data.expiring_soon || []).map((r) => [r.member, r.plan, r.end_date])),
    );
  }

  if (type === 'full') {
    body += section(
      'Live Check-ins',
      'Members currently in the gym',
      table(['Member', 'Checked in at'], (data.active_check_ins || []).map((r) => [r.name, r.check_in])),
    );

    const sch = data.schedule || {};
    body += section(
      'Class Schedule (This Week)',
      `${sch.week_start || ''} → ${sch.week_end || ''}`,
      kpiGrid([{ label: 'Active classes this week', value: sch.classes_this_week ?? 0 }]),
    );
  }

  if (type === 'full' || type === 'revenue') {
    const o = data.orders || {};
    const sub = data.subscriptions || {};
    const popular = s.most_popular_plan;

    body += section('Revenue Overview', data.report_period, kpiGrid([
      { label: 'Membership revenue (month)', value: fmtMoney(s.monthly_revenue) },
      { label: 'Store revenue (month)', value: fmtMoney(o.revenue_month) },
      { label: 'Subscription revenue (month)', value: fmtMoney(sub.revenue_month) },
      { label: 'Store orders (all time)', value: o.total ?? 0 },
    ]));

    if (type === 'revenue') {
      body += section('6-Month Revenue Trend', null, buildTrendBars(data.trends || []));
    }

    const statusRows = Object.entries(o.by_status || {}).map(([status, count]) => [status, count]);
    body += section('Store Orders by Status', null, table(['Status', 'Count'], statusRows));

    body += section(
      'Recent Store Orders',
      null,
      table(
        ['Order #', 'Customer', 'Total', 'Status', 'Date'],
        (data.recent_orders || []).map((r) => [r.order_number, r.customer, fmtMoney(r.total), r.status, r.date]),
      ),
    );

    body += section('Subscriptions', null, kpiGrid([
      { label: 'Active paid subscriptions', value: sub.active ?? 0 },
      { label: 'Expired', value: sub.expired ?? 0 },
    ]));

    if (popular?.plan) {
      body += section(
        'Most Popular Plan',
        null,
        `<p class="highlight-plan"><strong>${esc(popular.plan.name)}</strong> — ${popular.total_subscriptions} subscriptions</p>`,
      );
    }
  }

  if (type === 'full') {
    const p = data.products || {};
    body += section('Store Inventory', null, kpiGrid([
      { label: 'Total products', value: p.total ?? 0 },
      { label: 'Active', value: p.active ?? 0 },
      { label: 'Inactive', value: p.inactive ?? 0 },
      { label: 'Low stock (≤5)', value: p.low_stock ?? 0 },
    ]));
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(meta.title)} — Alien Fitness</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #111;
      background: #f4f4f5;
      line-height: 1.45;
      padding: 32px;
    }
    .page {
      max-width: 900px;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      color: #fff;
      padding: 36px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 4px solid #daf900;
    }
    .brand { display: flex; align-items: center; gap: 16px; }
    .brand img { width: 56px; height: 56px; object-fit: contain; }
    .brand h1 { font-size: 26px; font-weight: 900; letter-spacing: 0.04em; }
    .brand p { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #daf900; margin-top: 4px; }
    .meta { text-align: right; font-size: 12px; color: #aaa; }
    .meta strong { display: block; color: #fff; font-size: 14px; margin-bottom: 6px; }
    .content { padding: 36px 40px 48px; }
    .report-title { font-size: 22px; font-weight: 800; margin-bottom: 6px; }
    .report-sub { color: #666; font-size: 14px; margin-bottom: 32px; }
    .report-section { margin-bottom: 36px; page-break-inside: avoid; }
    .report-section h2 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #0a0a0a;
      border-left: 4px solid #daf900;
      padding-left: 12px;
      margin-bottom: 8px;
    }
    .section-sub { font-size: 13px; color: #666; margin-bottom: 16px; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .kpi {
      border: 1px solid #e5e5e5;
      border-radius: 10px;
      padding: 16px;
      background: #fafafa;
    }
    .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #666; }
    .kpi-value { font-size: 24px; font-weight: 900; color: #0a0a0a; margin: 6px 0; }
    .kpi-hint { font-size: 11px; color: #888; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    th {
      text-align: left;
      padding: 10px 12px;
      background: #0a0a0a;
      color: #daf900;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) td { background: #f9f9f9; }
    .empty { color: #999; font-size: 13px; font-style: italic; }
    .trend-chart {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      height: 160px;
      padding: 16px 0;
    }
    .trend-col { flex: 1; text-align: center; min-width: 0; }
    .trend-bar-wrap {
      height: 100px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .trend-bar {
      width: 100%;
      max-width: 40px;
      background: linear-gradient(180deg, #daf900, #a8c400);
      border-radius: 4px 4px 0 0;
      min-height: 8px;
    }
    .trend-rev { font-size: 10px; font-weight: 700; margin-top: 8px; }
    .trend-month { font-size: 11px; font-weight: 700; color: #333; }
    .trend-sub { font-size: 9px; color: #888; }
    .highlight-plan { font-size: 15px; padding: 12px; background: #f5ffd6; border-radius: 8px; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 10px;
      color: #999;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="brand">
        <img src="${LOGO_URL}" alt="Alien Fitness" />
        <div>
          <h1>Alien Fitness</h1>
          <p>Performance Command Center</p>
        </div>
      </div>
      <div class="meta">
        <strong>${esc(meta.title)}</strong>
        Generated<br>${esc(generated)}
      </div>
    </header>
    <div class="content">
      <p class="report-sub">${esc(meta.subtitle)}</p>
      ${body}
      <div class="footer">Confidential — Alien Fitness internal report · ${esc(generated)}</div>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script>
</body>
</html>`;
}

export function openAdminReport(data, type = 'full') {
  const html = buildReportHtml(data, type);
  const win = window.open('', '_blank');
  if (!win) {
    throw new Error('Pop-up blocked. Allow pop-ups to export the report.');
  }
  win.document.write(html);
  win.document.close();
}

export function downloadAdminReportHtml(data, type = 'full') {
  const html = buildReportHtml(data, type).replace(/<script[\s\S]*?<\/script>/i, '');
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const slug = type === 'full' ? 'operations' : type;
  a.href = url;
  a.download = `alien-fitness-${slug}-report-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export const REPORT_OPTIONS = [
  { id: 'full', label: 'Operations Overview', description: 'Full gym snapshot' },
  { id: 'members', label: 'Members & Memberships', description: 'Members, plans & expiring' },
  { id: 'revenue', label: 'Revenue & Sales', description: 'Orders, subscriptions & trends' },
];
