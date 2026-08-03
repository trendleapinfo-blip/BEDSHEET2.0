import Coupon from "@/models/Coupon";

/**
 * Validates coupon rules server-side.
 * Returns { valid: boolean, discount: number, coupon: object|null, error: string|null }
 */
export async function validateCouponServerSide(couponCode, subtotal, userAccountType = "Individual User") {
  if (!couponCode) {
    return { valid: false, discount: 0, coupon: null, error: null };
  }

  if (userAccountType !== "Individual User") {
    return { valid: false, discount: 0, coupon: null, error: "Coupons are only available for B2C Individual Users." };
  }

  const uppercaseCode = couponCode.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: uppercaseCode });

  if (!coupon) {
    return { valid: false, discount: 0, coupon: null, error: "Invalid coupon code." };
  }

  if (!coupon.isActive) {
    return { valid: false, discount: 0, coupon: null, error: "This coupon is no longer active." };
  }

  const now = new Date();

  if (coupon.startDate && now < new Date(coupon.startDate)) {
    return { valid: false, discount: 0, coupon: null, error: "This coupon promotion has not started yet." };
  }

  if (coupon.endDate && now > new Date(coupon.endDate)) {
    return { valid: false, discount: 0, coupon: null, error: "This coupon code has expired." };
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, coupon: null, error: "This coupon usage limit has been reached." };
  }

  if (Number(subtotal) < coupon.minPurchase) {
    return {
      valid: false,
      discount: 0,
      coupon: null,
      error: `Minimum order value of ₹${coupon.minPurchase} required to apply this coupon.`
    };
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.round(Number(subtotal) * (coupon.discountValue / 100));
    if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === "flat") {
    discount = coupon.discountValue;
  }

  if (discount > Number(subtotal)) {
    discount = Math.round(Number(subtotal));
  }

  return { valid: true, discount, coupon, error: null };
}
