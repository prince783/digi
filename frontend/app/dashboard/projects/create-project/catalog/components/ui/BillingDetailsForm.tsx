"use client";

import { INDIAN_STATES } from "@/lib/billing";
import type { Billing, BillingErrors } from "@/lib/billing";
import { FormInput } from "./form-controls";

export default function BillingDetailsForm({
  billing,
  errors,
  onChange,
}: {
  billing: Billing;
  errors: BillingErrors;
  onChange: (field: keyof Billing, value: string) => void;
}) {
  return (
    <div className="mb-5 rounded-2xl border border-line bg-white p-5">
      <h3 className="text-sm font-bold text-ink">Billing Details</h3>
      <p className="mt-1 text-xs leading-5 text-muted">
        Used for your invoice.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormInput
            id="field-billingAddress"
            label="Address"
            required
            value={billing.address}
            onChange={(value) => onChange("address", value)}
            placeholder="Street address"
            error={errors.address}
          />
        </div>

        <FormInput
          id="field-billingCity"
          label="City"
          required
          value={billing.city}
          onChange={(value) => onChange("city", value)}
          placeholder="City"
          error={errors.city}
        />

        <label id="field-billingState" className="block">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
              State
              <span className="text-red-500">*</span>
            </span>
          </div>

          <div
            className={`flex overflow-hidden rounded-xl border bg-white transition focus-within:ring-2 ${
              errors.state
                ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
                : "border-line focus-within:border-muted focus-within:ring-line"
            }`}
          >
            <select
              value={billing.state}
              onChange={(event) => onChange("state", event.target.value)}
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none"
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {errors.state && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.state}
            </p>
          )}
        </label>

        <div className="sm:col-span-2">
          <FormInput
            id="field-billingPincode"
            label="Pincode"
            required
            value={billing.pincode}
            onChange={(value) =>
              onChange("pincode", value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="6-digit pincode"
            inputMode="numeric"
            maxLength={6}
            error={errors.pincode}
          />
        </div>
      </div>
    </div>
  );
}
