import { validateBillingFields } from "@/lib/billing";
import type { Billing, BillingErrors } from "@/lib/billing";
import type { Company } from "../../catalog-editor.types";

export function createCatalogFormActions (state: ReturnType<typeof import("../hooks/useCatalogEditorState")["useCatalogEditorState"]>) {
  const {
    billing,
    reportMissingFields,
    sameWhatsappAsMobile,
    setBilling,
    setBillingErrors,
    setCompany,
    setCompanyErrors,
    setHasChanges
  } = state;

function updateCompany(field: keyof Company, value: string) {
    setHasChanges(true);

    setCompany((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "mobile" && sameWhatsappAsMobile
        ? { whatsapp: value }
        : {}),
    }));

    if (
      field === "companyName" ||
      field === "mobile" ||
      field === "aboutCompany" ||
      field === "address"
    ) {
      setCompanyErrors((previous) => {
        if (!previous[field]) return previous;
        const next = { ...previous };
        delete next[field];
        return next;
      });
    }
  }

function updateBilling(field: keyof Billing, value: string) {
    setHasChanges(true);
    setBilling((previous) => ({ ...previous, [field]: value }));

    setBillingErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

function validateBilling() {
    const errors = validateBillingFields(billing);
    setBillingErrors(errors);

    const missing: { id: string; label: string }[] = [];
    if (errors.address) missing.push({ id: "field-billingAddress", label: "Address" });
    if (errors.city) missing.push({ id: "field-billingCity", label: "City" });
    if (errors.state) missing.push({ id: "field-billingState", label: "State" });
    if (errors.pincode) missing.push({ id: "field-billingPincode", label: "Pincode" });

    if (missing.length > 0) {
      reportMissingFields(missing);
      return false;
    }

    return true;
  }

  return { updateCompany, updateBilling, validateBilling };
}
