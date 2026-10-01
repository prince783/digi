import { getUserId, normalizeUsername } from "../utils/catalog-editor.utils";
import type { CatalogResponse, DraftData, Product } from "../../catalog-editor.types";
import { useCatalogEditorState } from "../hooks/useCatalogEditorState";

type Callbacks = { validateHero: () => boolean; setSuccessToast: (message: string | null) => void; setErrorToast: (message: string | null) => void };

export function createCatalogPersistenceActions(state: ReturnType<typeof useCatalogEditorState>, { validateHero, setSuccessToast, setErrorToast }: Callbacks) {
  const {
    billing,
    catalogId,
    category,
    company,
    editingProductId,
    hero,
    layoutTemplateId,
    originalUsernameRef,
    productCategories,
    products,
    savingServerRef,
    setCatalogId,
    setErrorToast: setStateErrorToast,
    setHasChanges,
    setLastSaved,
    setSaveErrorMessage,
    setSaveSuccess,
    setSavingDraft,
    setSuccessToast: setStateSuccessToast,
    setUserId,
    setUsername,
    setUsernameMessage,
    setUsernameStatus,
    templateId,
    userId,
    username
  } = state;

function updateCatalogUrl(id: string) {
    if (!id) return;

    const url = new URL(window.location.href);
    url.searchParams.set("edit", id);
    window.history.replaceState({}, "", url.toString());
  }

async function resolveAuthenticatedUserId(): Promise<string> {
    // 1. Already available in CatalogEditor
    const existingId = String(userId || getUserId() || "").trim();

    if (existingId) {
      if (!userId) {
        setUserId(existingId);
      }

      return existingId;
    }

    // 2. Use the same authenticated session used by OrderStep
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("Unable to read login session.");
      }

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Login session expired. Please login again.",
        );
      }

      const candidates = [
        data?.user?._id,
        data?.user?.id,
        data?.user?.userId,

        data?.data?._id,
        data?.data?.id,
        data?.data?.userId,

        data?._id,
        data?.id,
        data?.userId,
      ];

      const resolvedId =
        candidates
          .find((value) => typeof value === "string" && value.trim().length > 0)
          ?.trim() || "";

      if (!resolvedId) {
        console.error("[Catalog] /api/auth/me response:", data);

        throw new Error(
          "Logged-in user ID could not be found. Please login again.",
        );
      }

      setUserId(resolvedId);

      return resolvedId;
    } catch (error) {
      console.error("[Catalog] Failed to resolve authenticated user:", error);

      throw new Error(
        error instanceof Error
          ? error.message
          : "Unable to identify logged-in user.",
      );
    }
  }

async function saveDraft(showMessage = true): Promise<string | null> {
    if (savingServerRef.current) {
      throw new Error(
        "Catalog is currently being saved. Please wait a moment and try again.",
      );
    }

    const cleanUsername = normalizeUsername(username);

    if (!cleanUsername) {
      setUsernameStatus("invalid");
      setUsernameMessage("Please enter a username to save the draft.");
      setSaveErrorMessage("Please enter a username to save the draft.");
      throw new Error("Please enter a username to save the draft.");
    }

    if (!validateHero()) {
      throw new Error(
        "Please shorten your hero title or description to fit the selected template.",
      );
    }

    if (editingProductId) {
      throw new Error(
        "Please save the current product before saving the catalog.",
      );
    }

    const persistedProducts = products.filter((product) =>
      String(product.name || "").trim(),
    );

    /*
     * ---------------------------------------------------------
     * AUTHENTICATED USER
     * ---------------------------------------------------------
     */

    let effectiveUserId = String(userId || getUserId() || "").trim();

    /*
     * Existing catalog can be updated without
     * needing to create a new catalog.
     */
    const existingCatalogId = String(catalogId || "").trim();

    /*
     * NEW CATALOG:
     * If userId is missing, get it from the
     * authenticated /api/auth/me session.
     */
    if (!existingCatalogId && !effectiveUserId) {
      effectiveUserId = await resolveAuthenticatedUserId();
    }

    if (effectiveUserId && effectiveUserId !== userId) {
      setUserId(effectiveUserId);
    }

    /*
     * POST /api/catalogs requires userId.
     */
    if (!existingCatalogId && !effectiveUserId) {
      throw new Error(
        "Your user account could not be identified for creating a new catalog. Please log in again and try once more.",
      );
    }

    savingServerRef.current = true;
    setSavingDraft(true);
    setSaveSuccess(false);

    try {
      const payload = {
        ...(existingCatalogId
          ? {
              catalogId: existingCatalogId,
            }
          : {}),

        ...(effectiveUserId
          ? {
              userId: effectiveUserId,
            }
          : {}),

        username: cleanUsername,

        templateId: layoutTemplateId,
        layoutTemplateId,

        company: {
          ...company,
        },

        billing: {
          ...billing,
        },

        category,
        hero,

        products: persistedProducts.map((product) => ({
          id: String(product.id),

          name: String(product.name || "").trim(),

          description: String(product.description || "").trim(),

          sellingPrice: Number(product.sellingPrice || 0),

          mrp: Number(product.mrp || 0),

          image: String(product.image || ""),

          categoryId: String(product.categoryId || ""),
        })),

        productCategories: productCategories.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          icon: item.icon,
        })),
      };

      const isUpdate = Boolean(existingCatalogId);

      const response = await fetch("/api/catalogs", {
        method: isUpdate ? "PUT" : "POST",

        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data: CatalogResponse = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            `Failed to ${isUpdate ? "update" : "create"} catalog.`,
        );
      }

      const returnedId = String(
        data?.catalogId ||
          data?.catalog?._id ||
          data?._id ||
          existingCatalogId ||
          "",
      ).trim();

      if (!returnedId) {
        throw new Error(
          "Catalog was saved, but the server did not return a catalog ID.",
        );
      }

      setCatalogId(returnedId);
      setHasChanges(false);
      setSaveErrorMessage("");

      updateCatalogUrl(returnedId);

      originalUsernameRef.current = cleanUsername;

      setUsername(cleanUsername);

      setUsernameStatus("available");

      setUsernameMessage("Username saved.");
      setSaveSuccess(true);

      const formatted = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setLastSaved(formatted);

      return returnedId;
    } catch (error) {
      console.error("Failed to save catalog:", error);

      setLastSaved("Local draft");
      setSaveSuccess(false);
      setSaveErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save catalog. Your local draft is saved.",
      );

      if (showMessage) {
        alert(
          error instanceof Error
            ? error.message
            : "Failed to save catalog. Your local draft is saved.",
        );
      }

      throw error;
    } finally {
      savingServerRef.current = false;

      setSavingDraft(false);
    }
  }

async function handleSaveDraft() {
    if (!normalizeUsername(username)) {
      setSaveErrorMessage("Please enter a username to save the draft.");
      setUsernameStatus("invalid");
      setUsernameMessage("Please enter a username to save the draft.");
      return;
    }

    try {
      await saveDraft(false);
      setStateSuccessToast("Draft saved successfully.");
    } catch {
      setStateErrorToast("Unable to save draft. Please try again.");
    }
  }

  return { updateCatalogUrl, resolveAuthenticatedUserId, saveDraft, handleSaveDraft };
}
