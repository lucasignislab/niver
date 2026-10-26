export type CheckoutContact = { name: string; email: string; phone: string };

export function checkoutUrl(link: string, coupon: string | null, contact: CheckoutContact, pageUrl: string): string {
  const url = new URL(link);
  if (coupon) url.searchParams.set("coupon", coupon);
  else url.searchParams.delete("coupon");
  url.searchParams.set("name", contact.name);
  url.searchParams.set("email", contact.email);
  url.searchParams.set("phone", contact.phone);
  url.searchParams.set("phone_local_code", "55");
  const page = new URL(pageUrl);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const value = page.searchParams.get(key);
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}
