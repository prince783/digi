import { getCatalogThemesForCategory, getDefaultCatalogThemeForCategory, CATALOG_THEMES as CATALOG_LAYOUT_THEMES } from "@/lib/catalogThemes";
import { getHeroDefaults } from "../config/catalog-editor.defaults";
import type { CatalogCategory } from "@/lib/catalogDummyData";
import type { HeroContent } from "../../catalog-editor.types";
import { normalizeCategory } from "../utils/catalog-editor.utils";
import { useCatalogEditorState } from "../hooks/useCatalogEditorState";

export function createCatalogThemeActions(state: ReturnType<typeof useCatalogEditorState>) {
  const {
    hero,
    heroCustomizedRef,
    layoutTemplateId,
    setCategory,
    setHasChanges,
    setHero,
    setLayoutTemplateId
  } = state;

function selectLayoutTemplate(nextTemplateId: string) {
    setHasChanges(true);
    const previousDefaults = getHeroDefaults(layoutTemplateId);
    const currentMatchesPreviousDefaults =
      hero.eyebrow === previousDefaults.eyebrow &&
      hero.title === previousDefaults.title &&
      hero.description === previousDefaults.description &&
      hero.image === previousDefaults.image;

    setLayoutTemplateId(nextTemplateId);

    if (!heroCustomizedRef.current || currentMatchesPreviousDefaults) {
      setHero({
        ...getHeroDefaults(nextTemplateId),
      });
      heroCustomizedRef.current = false;
    }
  }

function updateHero(field: keyof HeroContent, value: string) {
    setHasChanges(true);
    heroCustomizedRef.current = true;
    setHero((current) => ({ ...current, [field]: value }));
  }

function updateCatalogCategory(nextCategory: CatalogCategory) {
    setHasChanges(true);
    setCategory(nextCategory);

    const selectedTheme = CATALOG_LAYOUT_THEMES.find(
      (theme) => theme.id === layoutTemplateId,
    );

    if (
      !selectedTheme?.categories.some(
        (themeCategory) => themeCategory === nextCategory,
      )
    ) {
      setHasChanges(true);
      const compatibleTheme =
        getCatalogThemesForCategory(nextCategory).find(
          (theme) => theme.id === getDefaultCatalogThemeForCategory(nextCategory),
        ) ||
        getCatalogThemesForCategory(nextCategory)[0];

      if (compatibleTheme) {
        selectLayoutTemplate(compatibleTheme.id);
      }
    }
  }

  return { selectLayoutTemplate, updateHero, updateCatalogCategory };
}
