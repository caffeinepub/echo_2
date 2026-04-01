import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useTheme } from "../ThemeContext";
import { isAdminPrincipal } from "../config/admin";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { MockCard, MockCategory, MockSet } from "../store/mockCatalog";
import {
  addCard,
  addCategory,
  addSet,
  deleteCard,
  deleteCategory,
  deleteSet,
  getCards,
  getCategories,
  getSets,
  slugify,
  toggleCardActive,
  toggleCardSupported,
  toggleCategoryActive,
  toggleSetActive,
  updateCard,
  updateCategory,
  updateSet,
} from "../store/mockCatalog";

// ─── Types ────────────────────────────────────────────────────────────────────

type CatalogTab = "categories" | "sets" | "cards";

// ─── Styling helpers ──────────────────────────────────────────────────────────

function useCardStyle(isDark: boolean) {
  return isDark
    ? {
        background: "rgba(10, 28, 20, 0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(110, 230, 185, 0.15)",
        boxShadow:
          "0 0 20px rgba(80, 200, 150, 0.08), inset 0 1px 0 rgba(110, 230, 185, 0.07)",
        borderRadius: "16px",
      }
    : {
        background: "white",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        borderRadius: "16px",
      };
}

const MINT_BTN = {
  background: "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)",
  color: "#0f2a25",
  border: "none",
  borderRadius: "10px",
  padding: "8px 16px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(125,223,194,0.35)",
} as const;

const OUTLINE_BTN = (_isDark: boolean) =>
  ({
    background: "transparent",
    color: "#1f9d84",
    border: "1px solid rgba(31,157,132,0.4)",
    borderRadius: "8px",
    padding: "5px 10px",
    fontSize: "11px",
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.15s",
  }) as const;

const DELETE_BTN = {
  background: "transparent",
  color: "#e05c5c",
  border: "1px solid rgba(224,92,92,0.3)",
  borderRadius: "8px",
  padding: "5px 8px",
  fontSize: "11px",
  fontWeight: 500,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
} as const;

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        background: active ? "rgba(16,185,129,0.10)" : "rgba(156,163,175,0.15)",
        color: active ? "#1f9d84" : "#9ca3af",
        border: `1px solid ${active ? "rgba(31,157,132,0.25)" : "rgba(156,163,175,0.2)"}`,
        borderRadius: "12px",
        padding: "2px 8px",
        fontSize: "10px",
        fontWeight: 600,
        whiteSpace: "nowrap" as const,
      }}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function SupportedBadge() {
  return (
    <span
      style={{
        background: "rgba(100,210,255,0.12)",
        color: "#3ab4d4",
        border: "1px solid rgba(100,210,255,0.25)",
        borderRadius: "12px",
        padding: "2px 8px",
        fontSize: "10px",
        fontWeight: 600,
        whiteSpace: "nowrap" as const,
      }}
    >
      Supported
    </span>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  isDark,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  isDark: boolean;
}) {
  const fid = label.toLowerCase().replace(/\W+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fid}
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: isDark ? "rgba(150,210,185,0.8)" : "#374151",
        }}
      >
        {label}
      </label>
      <input
        id={fid}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: isDark ? "rgba(10, 28, 20, 0.5)" : "#f9fafb",
          border: isDark
            ? "1px solid rgba(110,230,185,0.18)"
            : "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "13px",
          color: isDark ? "rgba(220,248,235,0.92)" : "#111",
          outline: "none",
          width: "100%",
        }}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  isDark,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  isDark: boolean;
}) {
  const fid = label.toLowerCase().replace(/\W+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fid}
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: isDark ? "rgba(150,210,185,0.8)" : "#374151",
        }}
      >
        {label}
      </label>
      <select
        id={fid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: isDark ? "rgba(10, 28, 20, 0.5)" : "#f9fafb",
          border: isDark
            ? "1px solid rgba(110,230,185,0.18)"
            : "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "13px",
          color: isDark ? "rgba(220,248,235,0.92)" : "#111",
          outline: "none",
          width: "100%",
          cursor: "pointer",
        }}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
  isDark,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {value ? (
          <ToggleRight size={26} color="#1f9d84" />
        ) : (
          <ToggleLeft
            size={26}
            color={isDark ? "rgba(150,210,185,0.4)" : "#d1d5db"}
          />
        )}
      </button>
      <span
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: isDark ? "rgba(220,248,235,0.75)" : "#374151",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Form Panel ───────────────────────────────────────────────────────────────

function FormPanel({
  title,
  children,
  onCancel,
  onSave,
  saving,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  isDark: boolean;
}) {
  const cardStyle = useCardStyle(isDark);
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mb-5"
      style={cardStyle}
    >
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: isDark ? "rgba(110,230,185,0.1)" : "#f0f0f0" }}
      >
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: isDark ? "rgba(220,248,235,0.9)" : "#111",
          }}
        >
          {title}
        </p>
      </div>
      <div className="px-4 py-4 flex flex-col gap-3">
        {children}
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            style={MINT_BTN}
            onClick={onSave}
            disabled={saving}
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              border: isDark
                ? "1px solid rgba(110,230,185,0.15)"
                : "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              color: isDark ? "rgba(220,248,235,0.6)" : "#6b7280",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Categories Tab ──────────────────────────────────────────────────────────

type CategoryFormState = {
  name: string;
  slug: string;
  imageUrl: string;
  active: boolean;
  sortOrder: string;
};

const emptyCategoryForm = (): CategoryFormState => ({
  name: "",
  slug: "",
  imageUrl: "",
  active: true,
  sortOrder: "0",
});

function CategoriesTab({ isDark }: { isDark: boolean }) {
  const cardStyle = useCardStyle(isDark);
  const [categories, setCategories] = useState<MockCategory[]>(() =>
    getCategories().sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyCategoryForm());
  const [saving, setSaving] = useState(false);

  function reload() {
    setCategories(getCategories().sort((a, b) => a.sortOrder - b.sortOrder));
  }

  function setField<K extends keyof CategoryFormState>(
    k: K,
    v: CategoryFormState[K],
  ) {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "name" && !editId) next.slug = slugify(v as string);
      return next;
    });
  }

  function openCreate() {
    setEditId(null);
    setForm(emptyCategoryForm());
    setShowForm(true);
  }

  function openEdit(cat: MockCategory) {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl,
      active: cat.active,
      sortOrder: String(cat.sortOrder),
    });
    setShowForm(true);
  }

  function save() {
    setSaving(true);
    try {
      if (editId !== null) {
        updateCategory(editId, {
          name: form.name,
          slug: form.slug,
          imageUrl: form.imageUrl,
          active: form.active,
          sortOrder: Number(form.sortOrder) || 0,
        });
      } else {
        addCategory({
          name: form.name,
          slug: form.slug,
          imageUrl: form.imageUrl,
          active: form.active,
          sortOrder: Number(form.sortOrder) || 0,
        });
      }
      setShowForm(false);
      reload();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  function handleToggleActive(cat: MockCategory) {
    toggleCategoryActive(cat.id);
    reload();
  }

  function handleDelete(cat: MockCategory) {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    deleteCategory(cat.id);
    reload();
  }

  const textPrimary = isDark ? "rgba(220,248,235,0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150,210,185,0.55)" : "#9ca3af";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: "12px", color: textSecondary }}>
          {categories.length}{" "}
          {categories.length === 1 ? "category" : "categories"}
        </p>
        <button
          type="button"
          data-ocid="catalog.categories.open_modal_button"
          style={MINT_BTN}
          onClick={openCreate}
        >
          <Plus size={13} />
          Add Category
        </button>
      </div>

      {showForm && (
        <FormPanel
          title={editId !== null ? "Edit Category" : "New Category"}
          onCancel={() => setShowForm(false)}
          onSave={save}
          saving={saving}
          isDark={isDark}
        >
          <InputField
            label="Name"
            value={form.name}
            onChange={(v) => setField("name", v)}
            placeholder="Pokemon"
            isDark={isDark}
          />
          <InputField
            label="Slug"
            value={form.slug}
            onChange={(v) => setField("slug", v)}
            placeholder="pokemon"
            isDark={isDark}
          />
          <InputField
            label="Image URL (optional)"
            value={form.imageUrl}
            onChange={(v) => setField("imageUrl", v)}
            placeholder="https://..."
            isDark={isDark}
          />
          <InputField
            label="Sort Order"
            value={form.sortOrder}
            onChange={(v) => setField("sortOrder", v)}
            type="number"
            isDark={isDark}
          />
          <ToggleField
            label="Active"
            value={form.active}
            onChange={(v) => setField("active", v)}
            isDark={isDark}
          />
        </FormPanel>
      )}

      {categories.length === 0 ? (
        <div
          data-ocid="catalog.categories.empty_state"
          className="py-12 text-center"
          style={{ color: textSecondary, fontSize: "13px" }}
        >
          Create your first category
        </div>
      ) : (
        <div
          className="flex flex-col gap-2"
          data-ocid="catalog.categories.list"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              data-ocid={`catalog.categories.item.${i + 1}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={cardStyle}
            >
              <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: textPrimary,
                      }}
                    >
                      {cat.name}
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: textSecondary,
                        fontFamily: "monospace",
                      }}
                    >
                      /{cat.slug}
                    </p>
                  </div>
                  <ActiveBadge active={cat.active} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    data-ocid={`catalog.categories.edit_button.${i + 1}`}
                    style={OUTLINE_BTN(isDark)}
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.categories.toggle.${i + 1}`}
                    style={OUTLINE_BTN(isDark)}
                    onClick={() => handleToggleActive(cat)}
                  >
                    {cat.active ? (
                      <ToggleRight size={13} />
                    ) : (
                      <ToggleLeft size={13} />
                    )}
                    {cat.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.categories.delete_button.${i + 1}`}
                    style={DELETE_BTN}
                    onClick={() => handleDelete(cat)}
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sets Tab ────────────────────────────────────────────────────────────────

type SetFormState = {
  categoryId: string;
  name: string;
  slug: string;
  setCode: string;
  releaseYear: string;
  imageUrl: string;
  active: boolean;
  sortOrder: string;
  cardCount: string;
  featured: boolean;
};

const emptySetForm = (): SetFormState => ({
  categoryId: "",
  name: "",
  slug: "",
  setCode: "",
  releaseYear: "2024",
  imageUrl: "",
  active: true,
  sortOrder: "0",
  cardCount: "",
  featured: false,
});

function SetsTab({ isDark }: { isDark: boolean }) {
  const cardStyle = useCardStyle(isDark);
  const [sets, setSets] = useState<MockSet[]>(() =>
    getSets().sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [categories, setCategories] = useState<MockCategory[]>(() =>
    getCategories(),
  );
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SetFormState>(emptySetForm());
  const [saving, setSaving] = useState(false);

  function reload() {
    setSets(getSets().sort((a, b) => a.sortOrder - b.sortOrder));
    setCategories(getCategories());
  }

  function setField<K extends keyof SetFormState>(k: K, v: SetFormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "name" && !editId) next.slug = slugify(v as string);
      return next;
    });
  }

  function openCreate() {
    setEditId(null);
    setForm(emptySetForm());
    setShowForm(true);
  }

  function openEdit(set: MockSet) {
    setEditId(set.id);
    setForm({
      categoryId: set.categoryId,
      name: set.name,
      slug: set.slug,
      setCode: set.setCode,
      releaseYear: String(set.releaseYear),
      imageUrl: set.imageUrl,
      active: set.active,
      sortOrder: String(set.sortOrder),
      cardCount: set.cardCount !== null ? String(set.cardCount) : "",
      featured: set.featured,
    });
    setShowForm(true);
  }

  function save() {
    setSaving(true);
    try {
      const base = {
        categoryId: form.categoryId,
        name: form.name,
        slug: form.slug,
        setCode: form.setCode,
        releaseYear: Number(form.releaseYear) || 2024,
        imageUrl: form.imageUrl,
        active: form.active,
        sortOrder: Number(form.sortOrder) || 0,
        cardCount: form.cardCount ? Number(form.cardCount) : null,
        totalCards: form.cardCount ? Number(form.cardCount) : null,
        featured: form.featured,
      };
      if (editId !== null) {
        updateSet(editId, base);
      } else {
        addSet(base);
      }
      setShowForm(false);
      reload();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  function handleToggleActive(set: MockSet) {
    toggleSetActive(set.id);
    reload();
  }

  function handleDelete(set: MockSet) {
    if (!confirm(`Delete "${set.name}"?`)) return;
    deleteSet(set.id);
    reload();
  }

  const textPrimary = isDark ? "rgba(220,248,235,0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150,210,185,0.55)" : "#9ca3af";

  const catOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const catNameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: "12px", color: textSecondary }}>
          {sets.length} {sets.length === 1 ? "set" : "sets"}
        </p>
        <button
          type="button"
          data-ocid="catalog.sets.open_modal_button"
          style={MINT_BTN}
          onClick={openCreate}
        >
          <Plus size={13} />
          Add Set
        </button>
      </div>

      {showForm && (
        <FormPanel
          title={editId !== null ? "Edit Set" : "New Set"}
          onCancel={() => setShowForm(false)}
          onSave={save}
          saving={saving}
          isDark={isDark}
        >
          <SelectField
            label="Category"
            value={form.categoryId}
            onChange={(v) => setField("categoryId", v)}
            options={catOptions}
            isDark={isDark}
          />
          <InputField
            label="Set Name"
            value={form.name}
            onChange={(v) => setField("name", v)}
            placeholder="Scarlet & Violet Base"
            isDark={isDark}
          />
          <InputField
            label="Slug"
            value={form.slug}
            onChange={(v) => setField("slug", v)}
            placeholder="scarlet-violet-base"
            isDark={isDark}
          />
          <InputField
            label="Set Code"
            value={form.setCode}
            onChange={(v) => setField("setCode", v)}
            placeholder="SV1"
            isDark={isDark}
          />
          <InputField
            label="Release Year"
            value={form.releaseYear}
            onChange={(v) => setField("releaseYear", v)}
            type="number"
            isDark={isDark}
          />
          <InputField
            label="Cover Image URL (optional)"
            value={form.imageUrl}
            onChange={(v) => setField("imageUrl", v)}
            placeholder="https://..."
            isDark={isDark}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Card Count (optional)"
              value={form.cardCount}
              onChange={(v) => setField("cardCount", v)}
              type="number"
              isDark={isDark}
            />
            <InputField
              label="Sort Order"
              value={form.sortOrder}
              onChange={(v) => setField("sortOrder", v)}
              type="number"
              isDark={isDark}
            />
          </div>
          <div className="flex gap-6">
            <ToggleField
              label="Active"
              value={form.active}
              onChange={(v) => setField("active", v)}
              isDark={isDark}
            />
            <ToggleField
              label="Featured"
              value={form.featured}
              onChange={(v) => setField("featured", v)}
              isDark={isDark}
            />
          </div>
        </FormPanel>
      )}

      {sets.length === 0 ? (
        <div
          data-ocid="catalog.sets.empty_state"
          className="py-12 text-center"
          style={{ color: textSecondary, fontSize: "13px" }}
        >
          Create your first set
        </div>
      ) : (
        <div className="flex flex-col gap-2" data-ocid="catalog.sets.list">
          {sets.map((set, i) => (
            <motion.div
              key={set.id}
              data-ocid={`catalog.sets.item.${i + 1}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={cardStyle}
            >
              <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: textPrimary,
                      }}
                    >
                      {set.name}
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: textSecondary,
                        fontFamily: "monospace",
                      }}
                    >
                      {set.setCode} · {String(set.releaseYear)}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <span
                      style={{
                        background: "rgba(16,185,129,0.08)",
                        color: "#1f9d84",
                        border: "1px solid rgba(31,157,132,0.2)",
                        borderRadius: "10px",
                        padding: "2px 8px",
                        fontSize: "10px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {catNameById[set.categoryId] ?? set.categoryId}
                    </span>
                    <ActiveBadge active={set.active} />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    data-ocid={`catalog.sets.edit_button.${i + 1}`}
                    style={OUTLINE_BTN(isDark)}
                    onClick={() => openEdit(set)}
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.sets.toggle.${i + 1}`}
                    style={OUTLINE_BTN(isDark)}
                    onClick={() => handleToggleActive(set)}
                  >
                    {set.active ? (
                      <ToggleRight size={13} />
                    ) : (
                      <ToggleLeft size={13} />
                    )}
                    {set.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.sets.delete_button.${i + 1}`}
                    style={DELETE_BTN}
                    onClick={() => handleDelete(set)}
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Cards Tab ───────────────────────────────────────────────────────────────

type CardFormState = {
  setId: string;
  name: string;
  number: string;
  rarity: string;
  imageUrl: string;
  active: boolean;
  isSupported: boolean;
  sortOrder: string;
  tagPopulation10: string;
  tagPopulation9: string;
  tagPopulation8: string;
  totalTagPopulation: string;
  mintyTransactions: string;
  lastSalePriceUsd: string;
  averageSalePriceUsd: string;
  highestSalePriceUsd: string;
  lowestSalePriceUsd: string;
};

const emptyCardForm = (): CardFormState => ({
  setId: "",
  name: "",
  number: "",
  rarity: "",
  imageUrl: "",
  active: true,
  isSupported: false,
  sortOrder: "0",
  tagPopulation10: "0",
  tagPopulation9: "0",
  tagPopulation8: "0",
  totalTagPopulation: "0",
  mintyTransactions: "0",
  lastSalePriceUsd: "0",
  averageSalePriceUsd: "0",
  highestSalePriceUsd: "0",
  lowestSalePriceUsd: "0",
});

function CardsTab({ isDark }: { isDark: boolean }) {
  const cardStyle = useCardStyle(isDark);
  const [cards, setCards] = useState<MockCard[]>(() =>
    getCards().sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [sets, setSets] = useState<MockSet[]>(() => getSets());
  const [filterSetId, setFilterSetId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CardFormState>(emptyCardForm());
  const [saving, setSaving] = useState(false);

  function reload() {
    setCards(getCards().sort((a, b) => a.sortOrder - b.sortOrder));
    setSets(getSets());
  }

  function setField<K extends keyof CardFormState>(k: K, v: CardFormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function openCreate() {
    setEditId(null);
    setForm(emptyCardForm());
    setShowForm(true);
  }

  function openEdit(card: MockCard) {
    setEditId(card.id);
    setForm({
      setId: card.setId,
      name: card.name,
      number: card.number,
      rarity: card.rarity,
      imageUrl: card.imageUrl,
      active: card.active,
      isSupported: card.isSupported,
      sortOrder: String(card.sortOrder),
      tagPopulation10: String(card.tagPopulation10 ?? 0),
      tagPopulation9: String(card.tagPopulation9 ?? 0),
      tagPopulation8: String(card.tagPopulation8 ?? 0),
      totalTagPopulation: String(card.totalTagPopulation ?? 0),
      mintyTransactions: String(card.mintyTransactions ?? 0),
      lastSalePriceUsd: String(card.lastSalePriceUsd ?? 0),
      averageSalePriceUsd: String(card.averageSalePriceUsd ?? 0),
      highestSalePriceUsd: String(card.highestSalePriceUsd ?? 0),
      lowestSalePriceUsd: String(card.lowestSalePriceUsd ?? 0),
    });
    setShowForm(true);
  }

  function save() {
    setSaving(true);
    try {
      const base = {
        setId: form.setId,
        name: form.name,
        number: form.number,
        rarity: form.rarity,
        imageUrl: form.imageUrl,
        active: form.active,
        isSupported: form.isSupported,
        sortOrder: Number(form.sortOrder) || 0,
        tagPopulation10: Number(form.tagPopulation10) || 0,
        tagPopulation9: Number(form.tagPopulation9) || 0,
        tagPopulation8: Number(form.tagPopulation8) || 0,
        totalTagPopulation: Number(form.totalTagPopulation) || 0,
        mintyTransactions: Number(form.mintyTransactions) || 0,
        lastSalePriceUsd: Number(form.lastSalePriceUsd) || 0,
        averageSalePriceUsd: Number(form.averageSalePriceUsd) || 0,
        highestSalePriceUsd: Number(form.highestSalePriceUsd) || 0,
        lowestSalePriceUsd: Number(form.lowestSalePriceUsd) || 0,
        preferredCurrency: "USD" as const,
      };
      if (editId !== null) {
        updateCard(editId, base);
      } else {
        addCard(base);
      }
      setShowForm(false);
      reload();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  function handleToggleActive(card: MockCard) {
    toggleCardActive(card.id);
    reload();
  }

  function handleToggleSupported(card: MockCard) {
    toggleCardSupported(card.id);
    reload();
  }

  function handleDelete(card: MockCard) {
    if (!confirm(`Delete "${card.name}"?`)) return;
    deleteCard(card.id);
    reload();
  }

  const textPrimary = isDark ? "rgba(220,248,235,0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150,210,185,0.55)" : "#9ca3af";

  const setOptions = sets.map((s) => ({ value: s.id, label: s.name }));
  const setNameMap = Object.fromEntries(sets.map((s) => [s.id, s.name]));

  const filteredCards = filterSetId
    ? cards.filter((c) => c.setId === filterSetId)
    : cards;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontSize: "12px", color: textSecondary }}>
          {filteredCards.length} {filteredCards.length === 1 ? "card" : "cards"}
        </p>
        <button
          type="button"
          data-ocid="catalog.cards.open_modal_button"
          style={MINT_BTN}
          onClick={openCreate}
        >
          <Plus size={13} />
          Add Card
        </button>
      </div>

      {/* Filter by set */}
      <div className="mb-4">
        <SelectField
          label="Filter by Set"
          value={filterSetId}
          onChange={setFilterSetId}
          options={[{ value: "", label: "All Sets" }, ...setOptions]}
          isDark={isDark}
        />
      </div>

      {showForm && (
        <FormPanel
          title={editId !== null ? "Edit Card" : "New Card"}
          onCancel={() => setShowForm(false)}
          onSave={save}
          saving={saving}
          isDark={isDark}
        >
          <SelectField
            label="Set"
            value={form.setId}
            onChange={(v) => setField("setId", v)}
            options={setOptions}
            isDark={isDark}
          />
          <InputField
            label="Card Name"
            value={form.name}
            onChange={(v) => setField("name", v)}
            placeholder="Charizard ex"
            isDark={isDark}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Card Number (optional)"
              value={form.number}
              onChange={(v) => setField("number", v)}
              placeholder="004/198"
              isDark={isDark}
            />
            <InputField
              label="Rarity (optional)"
              value={form.rarity}
              onChange={(v) => setField("rarity", v)}
              placeholder="Double Rare"
              isDark={isDark}
            />
          </div>
          <InputField
            label="Image URL (optional)"
            value={form.imageUrl}
            onChange={(v) => setField("imageUrl", v)}
            placeholder="https://..."
            isDark={isDark}
          />
          <InputField
            label="Sort Order"
            value={form.sortOrder}
            onChange={(v) => setField("sortOrder", v)}
            type="number"
            isDark={isDark}
          />
          {/* TAG Population */}
          <div
            style={{
              borderTop: isDark
                ? "1px solid rgba(110,230,185,0.1)"
                : "1px solid #e5e7eb",
              paddingTop: "12px",
              marginTop: "4px",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#10b981",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "10px",
              }}
            >
              TAG Population
            </p>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="TAG 10 Pop"
                value={form.tagPopulation10}
                onChange={(v) => setField("tagPopulation10", v)}
                type="number"
                isDark={isDark}
              />
              <InputField
                label="TAG 9 Pop"
                value={form.tagPopulation9}
                onChange={(v) => setField("tagPopulation9", v)}
                type="number"
                isDark={isDark}
              />
              <InputField
                label="TAG 8 Pop"
                value={form.tagPopulation8}
                onChange={(v) => setField("tagPopulation8", v)}
                type="number"
                isDark={isDark}
              />
              <InputField
                label="Total TAG Pop"
                value={form.totalTagPopulation}
                onChange={(v) => setField("totalTagPopulation", v)}
                type="number"
                isDark={isDark}
              />
            </div>
          </div>
          {/* Market Data */}
          <div
            style={{
              borderTop: isDark
                ? "1px solid rgba(110,230,185,0.1)"
                : "1px solid #e5e7eb",
              paddingTop: "12px",
              marginTop: "4px",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#10b981",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "10px",
              }}
            >
              Market Data
            </p>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Minty Transactions"
                value={form.mintyTransactions}
                onChange={(v) => setField("mintyTransactions", v)}
                type="number"
                isDark={isDark}
              />
              <InputField
                label="Last Sale (USD)"
                value={form.lastSalePriceUsd}
                onChange={(v) => setField("lastSalePriceUsd", v)}
                type="number"
                isDark={isDark}
              />
              <InputField
                label="Avg Sale (USD)"
                value={form.averageSalePriceUsd}
                onChange={(v) => setField("averageSalePriceUsd", v)}
                type="number"
                isDark={isDark}
              />
              <InputField
                label="Highest Sale (USD)"
                value={form.highestSalePriceUsd}
                onChange={(v) => setField("highestSalePriceUsd", v)}
                type="number"
                isDark={isDark}
              />
              <InputField
                label="Lowest Sale (USD)"
                value={form.lowestSalePriceUsd}
                onChange={(v) => setField("lowestSalePriceUsd", v)}
                type="number"
                isDark={isDark}
              />
            </div>
          </div>
          <div className="flex gap-6">
            <ToggleField
              label="Active"
              value={form.active}
              onChange={(v) => setField("active", v)}
              isDark={isDark}
            />
            <ToggleField
              label="Supported"
              value={form.isSupported}
              onChange={(v) => setField("isSupported", v)}
              isDark={isDark}
            />
          </div>
        </FormPanel>
      )}

      {filteredCards.length === 0 ? (
        <div
          data-ocid="catalog.cards.empty_state"
          className="py-12 text-center"
          style={{ color: textSecondary, fontSize: "13px" }}
        >
          Create your first card
        </div>
      ) : (
        <div className="flex flex-col gap-2" data-ocid="catalog.cards.list">
          {filteredCards.map((card, i) => (
            <motion.div
              key={card.id}
              data-ocid={`catalog.cards.item.${i + 1}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              style={cardStyle}
            >
              <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: textPrimary,
                      }}
                    >
                      {card.name}
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: textSecondary,
                        fontFamily: "monospace",
                      }}
                    >
                      {card.number && `#${card.number} · `}
                      {card.rarity && `${card.rarity} · `}
                      {setNameMap[card.setId] ?? "Unknown Set"}
                    </p>
                    {(card.tagPopulation10 > 0 ||
                      card.lastSalePriceUsd > 0) && (
                      <p
                        style={{
                          fontSize: "9px",
                          color: "#10b981",
                          fontFamily: "monospace",
                          marginTop: "2px",
                        }}
                      >
                        {card.tagPopulation10 > 0 &&
                          `TAG10: ${card.tagPopulation10}`}
                        {card.tagPopulation10 > 0 &&
                          card.lastSalePriceUsd > 0 &&
                          " · "}
                        {card.lastSalePriceUsd > 0 &&
                          `Last: $${card.lastSalePriceUsd.toFixed(2)}`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <ActiveBadge active={card.active} />
                    {card.isSupported && <SupportedBadge />}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    data-ocid={`catalog.cards.edit_button.${i + 1}`}
                    style={OUTLINE_BTN(isDark)}
                    onClick={() => openEdit(card)}
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.cards.toggle.${i + 1}`}
                    style={OUTLINE_BTN(isDark)}
                    onClick={() => handleToggleActive(card)}
                  >
                    {card.active ? (
                      <ToggleRight size={13} />
                    ) : (
                      <ToggleLeft size={13} />
                    )}
                    {card.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.cards.secondary_button.${i + 1}`}
                    style={OUTLINE_BTN(isDark)}
                    onClick={() => handleToggleSupported(card)}
                  >
                    {card.isSupported ? "Unsupport" : "Mark Supported"}
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.cards.delete_button.${i + 1}`}
                    style={DELETE_BTN}
                    onClick={() => handleDelete(card)}
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ManageCatalogPage({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { identity } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<CatalogTab>("categories");

  const principal = identity?.getPrincipal().toText();
  const isAdmin = isAdminPrincipal(principal);

  const bgPage = isDark ? "#050f0a" : "#f7faf9";
  const textPrimary = isDark ? "rgba(220,248,235,0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150,210,185,0.55)" : "#9ca3af";

  const tabs: { id: CatalogTab; label: string }[] = [
    { id: "categories", label: "Categories" },
    { id: "sets", label: "Sets" },
    { id: "cards", label: "Cards" },
  ];

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: bgPage }}
        data-ocid="catalog.error_state"
      >
        <p style={{ fontSize: "32px", marginBottom: "12px" }}>🔒</p>
        <p
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: textPrimary,
            marginBottom: "6px",
          }}
        >
          Admin access required
        </p>
        <p
          style={{
            fontSize: "13px",
            color: textSecondary,
            marginBottom: "24px",
          }}
        >
          Sign in with an authorised Internet Identity to manage the catalog.
        </p>
        <button type="button" style={MINT_BTN} onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: bgPage }}
      data-ocid="catalog.page"
    >
      {/* Header */}
      <div
        className="sticky top-16 z-10 px-4 py-3 flex items-center gap-3"
        style={{
          background: isDark
            ? "rgba(5, 15, 10, 0.92)"
            : "rgba(247, 250, 249, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: isDark
            ? "1px solid rgba(110,230,185,0.1)"
            : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <button
          type="button"
          data-ocid="catalog.back.button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "#1f9d84",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <p
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: textPrimary,
          }}
        >
          Manage Catalog
        </p>
      </div>

      <div className="px-4 pt-4 pb-32 max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-5" data-ocid="catalog.tab">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-ocid={`catalog.${tab.id}.tab`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: isActive
                    ? "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)"
                    : isDark
                      ? "rgba(20, 50, 35, 0.5)"
                      : "#f3f4f6",
                  color: isActive
                    ? "#0f2a25"
                    : isDark
                      ? "rgba(150, 210, 185, 0.65)"
                      : "#6b7280",
                  border: isActive
                    ? "1px solid transparent"
                    : isDark
                      ? "1px solid rgba(110, 230, 185, 0.12)"
                      : "1px solid #e5e7eb",
                  boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <>
          {activeTab === "categories" && <CategoriesTab isDark={isDark} />}
          {activeTab === "sets" && <SetsTab isDark={isDark} />}
          {activeTab === "cards" && <CardsTab isDark={isDark} />}
        </>
      </div>
    </div>
  );
}
