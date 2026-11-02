// Quotation statuses — draft → sent → contacted → accepted / lost; "expired" is shown when an in-progress
// quotation is past its validity (the server sends it as display_status).
export const QUOTE_STATUS = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Sent', tone: 'primary' },
  contacted: { label: 'Contacted', tone: 'primary' },
  accepted: { label: 'Accepted', tone: 'success' },
  lost: { label: 'Lost', tone: 'neutral' },
  expired: { label: 'Expired', tone: 'neutral' },
};

export const IN_PROGRESS = ['draft', 'sent', 'contacted'];

/** Label + badge tone for staff screens. */
export const statusOf = (quote) => QUOTE_STATUS[quote.display_status ?? quote.status] ?? QUOTE_STATUS.sent;

/** What customers see: anything still in progress is simply "Open". */
export const customerStatusOf = (quote) => {
  const status = quote.display_status ?? quote.status;
  if (status === 'accepted') return { label: 'Accepted', tone: 'success' };
  if (status === 'lost') return { label: 'Closed', tone: 'neutral' };
  if (status === 'expired') return { label: 'Expired', tone: 'neutral' };
  return { label: 'Open', tone: 'primary' };
};
