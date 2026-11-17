// The one place a course's price is decided (ADR-0001).
//
// Sale Pricing (default): `discounted_price` is shown and charged; promo codes
// are not accepted. Promo-Only Pricing (`promo_only`): the course lists at full
// `price` and the only discount is a promo code at checkout. A discount never
// stacks on another discount.

export interface PricedCourse {
  is_free?: boolean | null;
  price?: number | null;
  discounted_price?: number | null;
  discount_percentage?: number | null;
  promo_only?: boolean | null;
}

export type CoursePrice =
  | { kind: 'free'; acceptsPromo: false }
  | {
      kind: 'paid';
      /** Amount the learner pays (before any promo code, which only Promo-Only accepts). */
      charge: number;
      /** Original price to show struck through; null when no sale discount applies. */
      listPrice: number | null;
      discountPercent: number | null;
      acceptsPromo: boolean;
    };

export function priceCourse(course: PricedCourse): CoursePrice {
  const price = Number(course.price) || 0;
  const sale = Number(course.discounted_price) || 0;
  if (course.is_free || (!price && !sale)) return { kind: 'free', acceptsPromo: false };

  if (course.promo_only) {
    return { kind: 'paid', charge: price || sale, listPrice: null, discountPercent: null, acceptsPromo: true };
  }

  const onSale = sale > 0 && (!price || sale < price);
  if (!onSale) return { kind: 'paid', charge: price, listPrice: null, discountPercent: null, acceptsPromo: false };

  const discountPercent = price
    ? Number(course.discount_percentage) || Math.round((1 - sale / price) * 100)
    : null;
  return { kind: 'paid', charge: sale, listPrice: price || null, discountPercent, acceptsPromo: false };
}

export const isFreeCourse = (course: PricedCourse) => priceCourse(course).kind === 'free';
