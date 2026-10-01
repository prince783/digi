import { useCatalogEditorState } from "../hooks/useCatalogEditorState";
import type { CompanyErrors } from "../../catalog-editor.types";

export function createCatalogValidationActions(state: ReturnType<typeof useCatalogEditorState>) {
  const {
    catalogId,
    company,
    originalUsernameRef,
    products,
    reportMissingFields,
    setCompanyErrors,
    setHeroErrors,
    setUsernameMessage,
    setUsernameStatus,
    setValidationToast,
    username,
    usernameStatus
  } = state;

function validateHero() {
    // Hero Title/Description fields were removed from this step (only
    // the slider remains), so there's nothing left here to require.
    setHeroErrors({});

    return true;
  }

function validateCompany() {
    const errors: CompanyErrors = {};
    // Field order matches the form's visual top-to-bottom order, so
    // the toast lists them the way the user will scroll past them
    // and the first one jumped to is genuinely the first on screen.
    const missing: { id: string; label: string }[] = [];

    if (!company.logo.trim()) {
      errors.logo = "Logo is required.";
      missing.push({ id: "field-logo", label: "Logo" });
    }

    if (!company.companyName.trim()) {
      errors.companyName = "Company name is required.";
      missing.push({ id: "field-companyName", label: "Company Name" });
    }

    if (!company.mobile.trim()) {
      errors.mobile = "Mobile number is required.";
      missing.push({ id: "field-mobile", label: "Mobile Number" });
    }

    if (!company.address.trim()) {
      errors.address = "Address is required.";
      missing.push({ id: "field-address", label: "Address" });
    }

    setCompanyErrors(errors);

    if (missing.length > 0) {
      reportMissingFields(missing);
      return false;
    }

    return true;
  }

function validateProducts() {
    const validProducts = products.filter(
      (product) =>
        product.name.trim() &&
        product.sellingPrice &&
        product.image,
    );

    if (validProducts.length === 0) {
      setValidationToast([
        "At least one complete product (name, price, and image)",
      ]);
      return false;
    }

    return true;
  }

function validateUsername() {
    if (!username) {
      setUsernameStatus("invalid");
      setUsernameMessage("Please enter a username.");
      reportMissingFields([{ id: "field-username", label: "Catalog Username" }]);
      return false;
    }

    if (username.length < 3) {
      setUsernameStatus("invalid");
      setUsernameMessage("Username must contain at least 3 characters.");
      reportMissingFields([{ id: "field-username", label: "Catalog Username" }]);
      return false;
    }

    if (
      catalogId &&
      originalUsernameRef.current &&
      username === originalUsernameRef.current
    ) {
      return true;
    }

    if (usernameStatus !== "available") {
      reportMissingFields([{ id: "field-username", label: "Catalog Username" }]);
      return false;
    }

    return true;
  }

  return { validateHero, validateCompany, validateProducts, validateUsername };
}
