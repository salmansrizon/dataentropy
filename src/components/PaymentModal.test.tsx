import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentModal from './PaymentModal';

vi.mock('@/hooks/useBookingData', () => ({
  useBookingData: () => ({ paymentSettings: { payment_window_minutes: 30, bkash_number: '017', nagad_number: '018' } }),
}));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

describe('PaymentModal', () => {
  it('hands paid checkouts the payment deadline from the countdown', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PaymentModal open onOpenChange={() => {}} title="Session" isFree={false} priceLabel="৳500" onSubmit={onSubmit} />);
    const before = Date.now();

    await userEvent.type(document.getElementById('payment-name')!, 'Ana');
    await userEvent.type(document.getElementById('payment-email')!, 'ana@example.com');
    await userEvent.click(screen.getAllByRole('button').find((b) => /bkash|বিকাশ/i.test(b.textContent ?? ''))!);
    await userEvent.type(document.getElementById('pm-txnId')!, 'TX1');
    await userEvent.click(screen.getAllByRole('button').find((b) => /বুকিং নিশ্চিত|Confirm Booking/.test(b.textContent ?? ''))!);

    const data = onSubmit.mock.calls[0][0];
    expect(data.transactionId).toBe('TX1');
    const deadline = Date.parse(data.paymentDeadline);
    expect(deadline).toBeGreaterThanOrEqual(before + 30 * 60_000);
    expect(deadline).toBeLessThan(Date.now() + 30 * 60_000 + 1000);
  });

  it('omits the deadline for free checkouts', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PaymentModal open onOpenChange={() => {}} title="Session" isFree onSubmit={onSubmit} />);
    await userEvent.type(document.getElementById('payment-name')!, 'Ana');
    await userEvent.type(document.getElementById('payment-email')!, 'ana@example.com');
    await userEvent.click(screen.getAllByRole('button').find((b) => /ফ্রি বুকিং|Confirm Free Booking/.test(b.textContent ?? ''))!);
    expect(onSubmit.mock.calls[0][0].paymentDeadline).toBeUndefined();
  });
});
