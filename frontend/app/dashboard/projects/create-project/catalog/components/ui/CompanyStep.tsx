"use client";

import { INDIAN_STATES } from "@/lib/billing";
import {
  BadgeCheck,
  Building2,
  Globe,
  ImagePlus,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";
import type { Company, CompanyErrors } from "../catalog-editor.types";
import { FormInput, FormTextarea } from "./form-controls";

export default function CompanyStep({
  company,
  errors,
  loading,
  sameWhatsappAsMobile,
  setSameWhatsappAsMobile,
  updateCompany,
  setLogoCropImage,
  onImageRemoved,
}: {
  company: Company;
  errors: CompanyErrors;
  loading: boolean;
  sameWhatsappAsMobile: boolean;
  setSameWhatsappAsMobile: (checked: boolean) => void;
  updateCompany: (field: keyof Company, value: string) => void;
  setLogoCropImage: (src: string | null) => void;
  onImageRemoved: () => void;
}) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-ink">
          Company Information
        </h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-11 animate-pulse rounded-xl bg-page"
            />
          ))}
        </div>
      ) : (
        <>
          <div id="field-logo" className="mb-3">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
              <ImagePlus size={15} />
              Logo
              <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-4">
              <div
                className={`flex h-20 w-[142px] shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-page ${
                  errors.logo ? "border-red-500" : "border-line"
                }`}
              >
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt="Company logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImagePlus size={22} className="text-muted" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 text-xs font-bold text-ink transition hover:bg-page">
                  <ImagePlus size={14} />
                  {company.logo ? "Change Logo" : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;

                      if (!file.type.startsWith("image/")) {
                        alert("Please select an image file.");
                        event.target.value = "";
                        return;
                      }

                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          setLogoCropImage(reader.result);
                        }
                      };
                      reader.onerror = () => {
                        alert("Unable to read this logo image.");
                      };
                      reader.readAsDataURL(file);
                      event.target.value = "";
                    }}
                  />
                </label>

                {company.logo && (
                  <button
                    type="button"
                    onClick={() => {
                      updateCompany("logo", "");
                      onImageRemoved();
                    }}
                    className="h-9 rounded-xl border border-line bg-white px-3 text-xs font-bold text-ink transition hover:bg-page"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {errors.logo && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.logo}
              </p>
            )}

            <p className="mt-2 text-xs text-muted">
              Shown in your catalog header. Wide (16:9), you&apos;ll crop
              after upload. PNG or JPG, no file size limit.
            </p>
          </div>

          <div className="grid gap-3">
            <FormInput
              id="field-companyName"
              label="Company Name"
              value={company.companyName}
              onChange={(value) => updateCompany("companyName", value)}
              placeholder="Enter company name"
              required
              error={errors.companyName}
              icon={<Building2 size={15} />}
              compact
            />

            <FormInput
              label="Tagline"
              value={company.tagline}
              onChange={(value) => updateCompany("tagline", value)}
              placeholder="e.g. Pure by Nature"
              icon={<BadgeCheck size={15} />}
              compact
            />

            <FormInput
              label="Contact Person"
              value={company.fullName}
              onChange={(value) => updateCompany("fullName", value)}
              placeholder="Enter full name"
              icon={<User size={15} />}
              compact
            />

            <FormInput
              id="field-mobile"
              label="Mobile Number"
              value={company.mobile}
              onChange={(value) => updateCompany("mobile", value)}
              placeholder="Enter mobile number"
              required
              error={errors.mobile}
              icon={<Phone size={15} />}
              compact
            />

            <FormInput
              label="WhatsApp Number"
              value={company.whatsapp}
              onChange={(value) => updateCompany("whatsapp", value)}
              placeholder="WhatsApp number"
              icon={<MessageCircle size={15} />}
              compact
            />

            {/* Email moved here so it shares WhatsApp Number's row
                instead of the "same as mobile" checkbox (moved below,
                after Website) leaving this cell empty. */}
            <FormInput
              label="Email"
              value={company.email}
              onChange={(value) => updateCompany("email", value)}
              placeholder="email@example.com"
              icon={<Mail size={15} />}
              compact
            />

            <label className="-mt-1 flex cursor-pointer items-center gap-2 text-xs font-medium text-muted sm:col-span-2">
              <input
                type="checkbox"
                checked={sameWhatsappAsMobile}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setSameWhatsappAsMobile(checked);
                  if (checked) {
                    updateCompany("whatsapp", company.mobile);
                  }
                }}
                className="h-4 w-4 rounded border-line accent-ink"
              />
              WhatsApp number is same as mobile number
            </label>

            <FormInput
              label="Website"
              value={company.website}
              onChange={(value) => updateCompany("website", value)}
              placeholder="www.example.com"
              icon={<Globe size={15} />}
              compact
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormInput
                id="field-address"
                label="Address Line 1"
                value={company.address}
                onChange={(value) => updateCompany("address", value)}
                placeholder="Street address"
                required
                error={errors.address}
                icon={<MapPin size={15} />}
                compact
              />
            </div>

            <FormInput
              label="City"
              value={company.city}
              onChange={(value) => updateCompany("city", value)}
              placeholder="City"
              compact
            />

            <label className="block">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  State
                </span>
              </div>
              <div className="flex h-9 overflow-hidden rounded-xl border border-line bg-white transition focus-within:border-muted focus-within:ring-2 focus-within:ring-line">
                <select
                  value={company.state}
                  onChange={(event) => updateCompany("state", event.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <FormInput
              label="Pincode"
              value={company.pincode}
              onChange={(value) =>
                updateCompany("pincode", value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="6-digit pincode"
              inputMode="numeric"
              maxLength={6}
              compact
            />
          </div>

          <div className="mt-3">
            <FormTextarea
              id="field-aboutCompany"
              label="About Company (Optional)"
              value={company.aboutCompany}
              onChange={(value) => updateCompany("aboutCompany", value)}
              placeholder="Short description about your company"
              error={errors.aboutCompany}
              rows={2}
              compact
            />
          </div>

        </>
      )}
    </div>
  );
}
