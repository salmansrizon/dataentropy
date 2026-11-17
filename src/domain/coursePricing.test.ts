import { describe, expect, it } from 'vitest';
import { priceCourse } from './coursePricing';

describe('priceCourse', () => {
  it('treats is_free or no price as free', () => {
    expect(priceCourse({ is_free: true, price: 500 }).kind).toBe('free');
    expect(priceCourse({ price: 0, discounted_price: null }).kind).toBe('free');
  });

  it('Sale Pricing charges the discounted price and rejects promo codes', () => {
    expect(priceCourse({ price: 1000, discounted_price: 750 })).toEqual({
      kind: 'paid', charge: 750, listPrice: 1000, discountPercent: 25, acceptsPromo: false,
    });
  });

  it('prefers the stored discount_percentage', () => {
    const p = priceCourse({ price: 1000, discounted_price: 750, discount_percentage: 30 });
    expect(p.kind === 'paid' && p.discountPercent).toBe(30);
  });

  it('ignores a discounted price that is not below the list price', () => {
    expect(priceCourse({ price: 1000, discounted_price: 1200 })).toEqual({
      kind: 'paid', charge: 1000, listPrice: null, discountPercent: null, acceptsPromo: false,
    });
  });

  it('Promo-Only Pricing lists at full price and accepts promo codes — never stacks', () => {
    expect(priceCourse({ price: 1000, discounted_price: 750, promo_only: true })).toEqual({
      kind: 'paid', charge: 1000, listPrice: null, discountPercent: null, acceptsPromo: true,
    });
  });

  it('a free course never accepts promo codes', () => {
    expect(priceCourse({ is_free: true, promo_only: true }).acceptsPromo).toBe(false);
  });
});
