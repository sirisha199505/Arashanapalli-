import { COMPANY } from '../../data/catalog';
import { CONTACT_PAGE } from '../../data/content';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../../data/instagram';
import { phoneUrl, whatsAppUrl } from '../../utils/share';
import Page from '../layout/Page';
import { Button, Card, Icon, IconTile } from '../ui';

const CHANNELS = [
  { icon: 'phone', label: 'Call us', value: COMPANY.phone, href: phoneUrl() },
  { icon: 'chat', label: 'WhatsApp', value: COMPANY.phone, href: whatsAppUrl(CONTACT_PAGE.whatsAppText) },
  { icon: 'pin', label: 'Visit our store', value: COMPANY.address, href: COMPANY.googleListing },
  { icon: 'instagram', label: 'Instagram', value: `@${INSTAGRAM_HANDLE}`, href: INSTAGRAM_URL },
  { icon: 'clock', label: 'Working days', value: COMPANY.workingDays },
];

const linkProps = (href) => (href ? { as: 'a', href, interactive: true, ...(href.startsWith('http') && { target: '_blank', rel: 'noreferrer' }) } : {});

/** How to reach the shop: call, WhatsApp, visit, Instagram. */
export default function ContactPage({ onGetQuote }) {
  return (
    <Page {...CONTACT_PAGE.section}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHANNELS.map((c) => (
          <Card key={c.label} {...linkProps(c.href)} className="flex gap-4 p-5">
            <IconTile name={c.icon} />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{c.value}</p>
            </div>
          </Card>
        ))}
      </div>
      <Button className="mt-8" onClick={onGetQuote}>
        Get a Quote <Icon name="arrow" className="h-4 w-4" />
      </Button>
    </Page>
  );
}
