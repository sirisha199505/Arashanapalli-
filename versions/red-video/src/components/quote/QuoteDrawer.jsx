import { useState } from 'react';
import { Button, EmptyState, Modal } from '../ui';
import BrandQuoteCard from './BrandQuoteCard';
import CustomerForm from './CustomerForm';
import { isCustomerValid } from '../../utils/share';

const EMPTY_CUSTOMER = { name: '', phone: '', city: '' };

export default function QuoteDrawer({ open, onClose, quotes, onQuantityChange, onRemove, onClear }) {
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const canSend = isCustomerValid(customer);

  return (
    <Modal open={open} onClose={onClose} placement="right" title={`My Quotes (${quotes.length} brand${quotes.length === 1 ? '' : 's'})`}>
      {quotes.length ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="mb-3 text-sm font-semibold">Your details (needed to send a quote)</p>
            <CustomerForm customer={customer} onChange={setCustomer} />
          </div>
          {quotes.map((quote) => (
            <BrandQuoteCard
              key={quote.brand.id}
              quote={quote}
              customer={customer}
              canSend={canSend}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
              onClear={onClear}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No quotes yet"
          message="Click “Get Quote” on any product, choose a brand, and it will appear here as a separate quote for that brand."
          action={<Button onClick={onClose}>Browse Products</Button>}
        />
      )}
    </Modal>
  );
}
