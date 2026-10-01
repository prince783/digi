"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Check, ChevronDown, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { CATEGORY_ICON_OPTIONS, DEFAULT_CATEGORY_ICON, CategoryIcon } from "@/lib/productCategoryIcons";
import type { ProductCategory } from "../catalog-editor.types";
import { FormInput } from "./form-controls";
export function CategoryThumb({
  category,
  size = 20,
}: {
  category: ProductCategory;
  size?: number;
}) {
  if (category.image) {
    return (
      <img
        src={category.image}
        alt={category.name}
        className="shrink-0 rounded-md object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-md bg-page text-ink"
      style={{ width: size, height: size }}
    >
      <CategoryIcon icon={category.icon} size={Math.round(size * 0.6)} />
    </span>
  );
}

export function CategoryDropdown({
  categories,
  value,
  onSelect,
  onAddNew,
  onEdit,
  onDelete,
}: {
  categories: ProductCategory[];
  value?: string;
  onSelect: (categoryId: string) => void;
  onAddNew: () => void;
  onEdit: (categoryId: string) => void;
  onDelete: (categoryId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = categories.find((category) => category.id === value);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted">
          Select Category
          <span className="normal-case font-medium text-muted">
            (optional)
          </span>
        </label>
        <button
          type="button"
          onClick={onAddNew}
          className="text-xs font-bold text-[#123f2e] hover:underline"
        >
          + Add New
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-line bg-white px-3 text-sm text-ink transition hover:border-muted"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <CategoryThumb category={selected} size={22} />
              <span className="truncate font-medium">{selected.name}</span>
            </>
          ) : (
            <span className="text-muted">Select Category</span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-line bg-white p-1.5 shadow-lg">
          {selected && (
            <button
              type="button"
              onClick={() => {
                onSelect("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-muted hover:bg-page"
            >
              Clear selection
            </button>
          )}

          {categories.length === 0 && (
            <p className="px-2.5 py-3 text-center text-xs text-muted">
              No categories yet.
            </p>
          )}

          {categories.map((category) => (
            <div
              key={category.id}
              className={`group flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 ${
                category.id === value ? "bg-green-50" : "hover:bg-page"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onSelect(category.id);
                  setOpen(false);
                }}
                className="flex min-w-0 flex-1 items-center gap-2 py-0.5 pl-1 text-left"
              >
                <CategoryThumb category={category} size={22} />
                <span className="truncate text-sm font-medium text-ink">
                  {category.name}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onEdit(category.id)}
                title="Edit"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted opacity-0 transition hover:bg-white hover:text-ink group-hover:opacity-100"
              >
                <Pencil size={13} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(category.id)}
                title="Delete"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted opacity-0 transition hover:bg-white hover:text-red-500 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>

              {category.id === value && (
                <Check size={14} className="shrink-0 text-green-600" />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              onAddNew();
              setOpen(false);
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-line px-2.5 py-2.5 text-left text-sm font-bold text-ink hover:bg-page"
          >
            <Plus size={14} />
            Add New Category
          </button>
        </div>
      )}
    </div>
  );
}

export function CategoryFormModal({
  mode,
  name,
  setName,
  icon,
  setIcon,
  image,
  onImageFileSelected,
  onRemoveImage,
  error,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  name: string;
  setName: (value: string) => void;
  icon: string;
  setIcon: (value: string) => void;
  image: string;
  onImageFileSelected: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  error: string;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink">
            {mode === "edit" ? "Edit Category" : "Add New Category"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-muted hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">
            Category Image (optional)
          </p>
          <div className="flex items-center gap-3">
            <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-page transition hover:border-muted">
              {image ? (
                <img
                  src={image}
                  alt="Category"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus size={18} className="text-muted" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageFileSelected}
              />
            </label>
            {image && (
              <button
                type="button"
                onClick={onRemoveImage}
                className="text-xs font-semibold text-red-600"
              >
                Remove image
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">
            Square (1:1), recommended around 400 × 400px.
          </p>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">
            Select Icon (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_ICON_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setIcon(option)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  icon === option
                    ? "border-[#123f2e] bg-[#123f2e]/10 text-[#123f2e]"
                    : "border-line text-muted hover:bg-page"
                }`}
              >
                <CategoryIcon icon={option} size={16} />
              </button>
            ))}
          </div>
        </div>

        <FormInput
          label="Category Name"
          value={name}
          onChange={setName}
          placeholder="e.g. Dry Fruits"
          required
          maxLength={30}
          counterMax={30}
          error={error || undefined}
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border border-line px-4 text-xs font-bold text-ink transition hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="h-10 rounded-xl bg-[#123f2e] px-4 text-xs font-bold text-white transition hover:bg-[#0d2e21]"
          >
            {mode === "edit" ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteCategoryConfirmModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="text-muted hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <p className="text-sm font-bold text-ink">
          Are you sure you want to delete this category?
        </p>
        <p className="mt-1 text-xs text-muted">
          This will remove it from the list.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 flex-1 rounded-xl border border-line text-xs font-bold text-ink transition hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 flex-1 rounded-xl bg-red-600 text-xs font-bold text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

