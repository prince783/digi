export type Billing = {
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type BillingErrors = Partial<Record<keyof Billing, string>>;

export const DEFAULT_BILLING: Billing = {
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export function validateBillingFields(billing: Billing): BillingErrors {
  const errors: BillingErrors = {};

  if (!billing.address.trim()) {
    errors.address = "Address is required.";
  }
  if (!billing.city.trim()) {
    errors.city = "City is required.";
  }
  if (!billing.state.trim()) {
    errors.state = "State is required.";
  }
  if (!/^\d{6}$/.test(billing.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit pincode.";
  }

  return errors;
}

/** Server-side sanitize: trims every field, defaults missing keys to "". */
export function cleanBilling(value: unknown): Billing {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const text = (item: unknown) =>
    typeof item === "string" ? item.trim() : "";

  return {
    address: text(source.address),
    city: text(source.city),
    state: text(source.state),
    pincode: text(source.pincode),
  };
}
