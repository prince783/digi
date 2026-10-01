import { useCatalogEditorState } from "../hooks/useCatalogEditorState";
import { normalizeUsername } from "../utils/catalog-editor.utils";

export function createCatalogUsernameActions(state: ReturnType<typeof useCatalogEditorState>) {
  const {
    catalogId,
    company,
    originalUsernameRef,
    setHasChanges,
    setSaveErrorMessage,
    setUsername,
    setUsernameMessage,
    setUsernameStatus,
    username,
    usernameTimerRef
  } = state;

function handleUsernameChange(value: string) {
    const cleaned = normalizeUsername(value);

    setHasChanges(true);
    setSaveErrorMessage("");
    setUsername(cleaned);
    setUsernameStatus("idle");
    setUsernameMessage("");

    if (usernameTimerRef.current) {
      clearTimeout(usernameTimerRef.current);
    }

    if (!cleaned) {
      return;
    }

    if (cleaned.length < 3) {
      setUsernameStatus("invalid");
      setUsernameMessage("Username must contain at least 3 characters.");
      return;
    }

    if (cleaned.length > 30) {
      setUsernameStatus("invalid");
      setUsernameMessage("Username cannot contain more than 30 characters.");
      return;
    }

    if (
      catalogId &&
      originalUsernameRef.current &&
      cleaned === originalUsernameRef.current
    ) {
      setUsernameStatus("available");
      setUsernameMessage("Current catalog username");
      return;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Checking username...");

    usernameTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/catalogs/check-username?username=${encodeURIComponent(
            cleaned,
          )}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (data.success && data.available) {
          setUsernameStatus("available");
          setUsernameMessage("Username is available.");
        } else {
          setUsernameStatus("taken");
          setUsernameMessage(data.message || "This username is already taken.");
        }
      } catch (error) {
        console.error("Username check failed:", error);

        setUsernameStatus("invalid");
        setUsernameMessage("Unable to check username. Please try again.");
      }
    }, 500);
  }

async function suggestUsernameFromCompany(force = false) {
    if (!force && (catalogId || originalUsernameRef.current || username)) return;

    const base = normalizeUsername(company.companyName || company.fullName);
    if (base.length < 3) {
      if (force) {
        setUsernameStatus("invalid");
        setUsernameMessage(
          "Business name is too short to suggest a username from. Please enter one manually.",
        );
      }
      return;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Finding an available username...");

    for (let suffix = 0; suffix <= 99; suffix += 1) {
      const candidate = normalizeUsername(
        suffix === 0 ? base : `${base}${suffix}`,
      );

      if (candidate.length < 3 || candidate.length > 30) continue;

      try {
        const response = await fetch(
          `/api/catalogs/check-username?username=${encodeURIComponent(candidate)}`,
          { cache: "no-store" },
        );
        const data = await response.json();

        if (data.success && data.available) {
          setUsername(candidate);
          setUsernameStatus("available");
          setUsernameMessage(
            suffix === 0
              ? "Username selected from your company name."
              : `Username selected: ${candidate}`,
          );
          return;
        }
      } catch (error) {
        console.error("Suggested username check failed:", error);
        setUsernameStatus("invalid");
        setUsernameMessage("Unable to check username. Please try again.");
        return;
      }
    }

    setUsername("");
    setUsernameStatus("invalid");
    setUsernameMessage(
      "No available username was found. Please enter one manually.",
    );
  }

  return { handleUsernameChange, suggestUsernameFromCompany };
}
