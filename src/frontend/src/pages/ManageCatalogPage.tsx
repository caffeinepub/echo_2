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
import { useEffect, useState } from "react";
import { useTheme } from "../ThemeContext";
import type {
  CreateTcgCardInput,
  CreateTcgCategoryInput,
  CreateTcgSetInput,
  TcgCard,
  TcgCategory,
  TcgSet,
  UpdateTcgCardInput,
  UpdateTcgCategoryInput,
  UpdateTcgSetInput,
} from "../backend.d";
import { isAdminPrincipal } from "../config/admin";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type CategoryFormState = {
  name: string;
  slug: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyCategoryForm = (): CategoryFormState => ({
  name: "",
  slug: "",
  imageUrl: "",
  isActive: true,
  sortOrder: "0",
});

function CategoriesTab({ isDark, actor }: { isDark: boolean; actor: any }) {
  const cardStyle = useCardStyle(isDark);
  const [categories, setCategories] = useState<TcgCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyCategoryForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const cats = await actor.getAllCategoriesAdmin();
      setCategories(
        cats.sort(
          (a: TcgCategory, b: TcgCategory) =>
            Number(a.sortOrder) - Number(b.sortOrder),
        ),
      );
    } catch {}
    setLoading(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: load is stable within component
  useEffect(() => {
    if (actor) load();
  }, [actor]);

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

  function openEdit(cat: TcgCategory) {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl,
      isActive: cat.isActive,
      sortOrder: String(Number(cat.sortOrder)),
    });
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editId !== null) {
        const input: UpdateTcgCategoryInput = {
          id: editId,
          name: form.name,
          slug: form.slug,
          imageUrl: form.imageUrl,
          isActive: form.isActive,
          sortOrder: BigInt(Number(form.sortOrder) || 0),
        };
        await actor.updateCategory(input);
      } else {
        const input: CreateTcgCategoryInput = {
          name: form.name,
          slug: form.slug,
          imageUrl: form.imageUrl,
          isActive: form.isActive,
          sortOrder: BigInt(Number(form.sortOrder) || 0),
        };
        await actor.createCategory(input);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  async function toggleActive(cat: TcgCategory) {
    try {
      await actor.toggleCategoryActive(cat.id);
      await load();
    } catch {}
  }

  async function deleteCategory(cat: TcgCategory) {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    try {
      await actor.deleteCategory(cat.id);
      await load();
    } catch {}
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
          New Category
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
            value={form.isActive}
            onChange={(v) => setField("isActive", v)}
            isDark={isDark}
          />
        </FormPanel>
      )}

      {loading ? (
        <div
          data-ocid="catalog.categories.loading_state"
          className="flex justify-center py-12"
        >
          <Loader2 size={20} className="animate-spin" color="#1f9d84" />
        </div>
      ) : categories.length === 0 ? (
        <div
          data-ocid="catalog.categories.empty_state"
          className="py-12 text-center"
          style={{ color: textSecondary, fontSize: "13px" }}
        >
          No categories yet. Create your first one.
        </div>
      ) : (
        <div
          className="flex flex-col gap-2"
          data-ocid="catalog.categories.list"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={String(cat.id)}
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
                  <ActiveBadge active={cat.isActive} />
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
                    onClick={() => toggleActive(cat)}
                  >
                    {cat.isActive ? (
                      <ToggleRight size={13} />
                    ) : (
                      <ToggleLeft size={13} />
                    )}
                    {cat.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.categories.delete_button.${i + 1}`}
                    style={DELETE_BTN}
                    onClick={() => deleteCategory(cat)}
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
  tcgCategory: string;
  setName: string;
  slug: string;
  setCode: string;
  releaseYear: string;
  coverImageUrl: string;
  isActive: boolean;
  sortOrder: string;
  cardCount: string;
  featured: boolean;
};

const emptySetForm = (): SetFormState => ({
  tcgCategory: "",
  setName: "",
  slug: "",
  setCode: "",
  releaseYear: "2024",
  coverImageUrl: "",
  isActive: true,
  sortOrder: "0",
  cardCount: "",
  featured: false,
});

function SetsTab({ isDark, actor }: { isDark: boolean; actor: any }) {
  const cardStyle = useCardStyle(isDark);
  const [sets, setSets] = useState<TcgSet[]>([]);
  const [categories, setCategories] = useState<TcgCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [form, setForm] = useState<SetFormState>(emptySetForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [s, c] = await Promise.all([
        actor.getAllSetsAdmin(),
        actor.getAllCategoriesAdmin(),
      ]);
      setSets(
        s.sort(
          (a: TcgSet, b: TcgSet) => Number(a.sortOrder) - Number(b.sortOrder),
        ),
      );
      setCategories(c);
    } catch {}
    setLoading(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: load is stable within component
  useEffect(() => {
    if (actor) load();
  }, [actor]);

  function setField<K extends keyof SetFormState>(k: K, v: SetFormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "setName" && !editId) next.slug = slugify(v as string);
      return next;
    });
  }

  function openCreate() {
    setEditId(null);
    setForm(emptySetForm());
    setShowForm(true);
  }

  function openEdit(set: TcgSet) {
    setEditId(set.id);
    setForm({
      tcgCategory: set.tcgCategory,
      setName: set.setName,
      slug: set.slug,
      setCode: set.setCode,
      releaseYear: String(Number(set.releaseYear)),
      coverImageUrl: set.coverImageUrl,
      isActive: set.isActive,
      sortOrder: String(Number(set.sortOrder)),
      cardCount:
        set.cardCount !== undefined && set.cardCount !== null
          ? String(Number(set.cardCount))
          : "",
      featured: set.featured,
    });
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    try {
      const base = {
        tcgCategory: form.tcgCategory,
        setName: form.setName,
        slug: form.slug,
        setCode: form.setCode,
        releaseYear: BigInt(Number(form.releaseYear) || 2024),
        coverImageUrl: form.coverImageUrl,
        isActive: form.isActive,
        sortOrder: BigInt(Number(form.sortOrder) || 0),
        cardCount: form.cardCount ? BigInt(Number(form.cardCount)) : undefined,
        featured: form.featured,
      };
      if (editId !== null) {
        await actor.updateSet({ ...base, id: editId } as UpdateTcgSetInput);
      } else {
        await actor.createSet(base as CreateTcgSetInput);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  async function toggleActive(set: TcgSet) {
    try {
      await actor.toggleSetActive(set.id);
      await load();
    } catch {}
  }

  async function deleteSet(set: TcgSet) {
    if (!confirm(`Delete "${set.setName}"?`)) return;
    try {
      await actor.deleteSet(set.id);
      await load();
    } catch {}
  }

  const textPrimary = isDark ? "rgba(220,248,235,0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150,210,185,0.55)" : "#9ca3af";

  const categoryOptions = categories.map((c) => ({
    value: c.slug,
    label: c.name,
  }));
  const staticOptions = [
    { value: "Pokemon", label: "Pokemon" },
    { value: "One Piece", label: "One Piece" },
    { value: "Yu-Gi-Oh", label: "Yu-Gi-Oh" },
    { value: "Sports", label: "Sports" },
  ];
  const catOptions =
    categoryOptions.length > 0 ? categoryOptions : staticOptions;

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
          New Set
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
            value={form.tcgCategory}
            onChange={(v) => setField("tcgCategory", v)}
            options={catOptions}
            isDark={isDark}
          />
          <InputField
            label="Set Name"
            value={form.setName}
            onChange={(v) => setField("setName", v)}
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
            value={form.coverImageUrl}
            onChange={(v) => setField("coverImageUrl", v)}
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
              value={form.isActive}
              onChange={(v) => setField("isActive", v)}
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

      {loading ? (
        <div
          data-ocid="catalog.sets.loading_state"
          className="flex justify-center py-12"
        >
          <Loader2 size={20} className="animate-spin" color="#1f9d84" />
        </div>
      ) : sets.length === 0 ? (
        <div
          data-ocid="catalog.sets.empty_state"
          className="py-12 text-center"
          style={{ color: textSecondary, fontSize: "13px" }}
        >
          No sets yet. Create your first one.
        </div>
      ) : (
        <div className="flex flex-col gap-2" data-ocid="catalog.sets.list">
          {sets.map((set, i) => (
            <motion.div
              key={String(set.id)}
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
                      {set.setName}
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: textSecondary,
                        fontFamily: "monospace",
                      }}
                    >
                      {set.setCode} · {String(Number(set.releaseYear))}
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
                      {set.tcgCategory}
                    </span>
                    <ActiveBadge active={set.isActive} />
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
                    onClick={() => toggleActive(set)}
                  >
                    {set.isActive ? (
                      <ToggleRight size={13} />
                    ) : (
                      <ToggleLeft size={13} />
                    )}
                    {set.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.sets.delete_button.${i + 1}`}
                    style={DELETE_BTN}
                    onClick={() => deleteSet(set)}
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
  cardName: string;
  cardNumber: string;
  rarity: string;
  imageUrl: string;
  isActive: boolean;
  isSupported: boolean;
  sortOrder: string;
};

const emptyCardForm = (): CardFormState => ({
  setId: "",
  cardName: "",
  cardNumber: "",
  rarity: "",
  imageUrl: "",
  isActive: true,
  isSupported: false,
  sortOrder: "0",
});

function CardsTab({ isDark, actor }: { isDark: boolean; actor: any }) {
  const cardStyle = useCardStyle(isDark);
  const [cards, setCards] = useState<TcgCard[]>([]);
  const [sets, setSets] = useState<TcgSet[]>([]);
  const [filterSetId, setFilterSetId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [form, setForm] = useState<CardFormState>(emptyCardForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [c, s] = await Promise.all([
        actor.getAllCardsAdmin(),
        actor.getAllSetsAdmin(),
      ]);
      setCards(
        c.sort(
          (a: TcgCard, b: TcgCard) => Number(a.sortOrder) - Number(b.sortOrder),
        ),
      );
      setSets(s);
    } catch {}
    setLoading(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: load is stable within component
  useEffect(() => {
    if (actor) load();
  }, [actor]);

  function setField<K extends keyof CardFormState>(k: K, v: CardFormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function openCreate() {
    setEditId(null);
    setForm(emptyCardForm());
    setShowForm(true);
  }

  function openEdit(card: TcgCard) {
    setEditId(card.id);
    setForm({
      setId: String(Number(card.setId)),
      cardName: card.cardName,
      cardNumber: card.cardNumber,
      rarity: card.rarity,
      imageUrl: card.imageUrl,
      isActive: card.isActive,
      isSupported: card.isSupported,
      sortOrder: String(Number(card.sortOrder)),
    });
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    try {
      const base = {
        setId: BigInt(Number(form.setId) || 0),
        cardName: form.cardName,
        cardNumber: form.cardNumber,
        rarity: form.rarity,
        imageUrl: form.imageUrl,
        isActive: form.isActive,
        isSupported: form.isSupported,
        sortOrder: BigInt(Number(form.sortOrder) || 0),
      };
      if (editId !== null) {
        await actor.updateCard({ ...base, id: editId } as UpdateTcgCardInput);
      } else {
        await actor.createCard(base as CreateTcgCardInput);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  async function toggleActive(card: TcgCard) {
    try {
      await actor.toggleCardActive(card.id);
      await load();
    } catch {}
  }

  async function toggleSupported(card: TcgCard) {
    try {
      await actor.toggleCardSupported(card.id);
      await load();
    } catch {}
  }

  async function deleteCard(card: TcgCard) {
    if (!confirm(`Delete "${card.cardName}"?`)) return;
    try {
      await actor.deleteCard(card.id);
      await load();
    } catch {}
  }

  const textPrimary = isDark ? "rgba(220,248,235,0.92)" : "#111";
  const textSecondary = isDark ? "rgba(150,210,185,0.55)" : "#9ca3af";

  const setOptions = sets.map((s) => ({
    value: String(Number(s.id)),
    label: s.setName,
  }));

  const setNameMap = Object.fromEntries(
    sets.map((s) => [String(Number(s.id)), s.setName]),
  );

  const filteredCards = filterSetId
    ? cards.filter((c) => String(Number(c.setId)) === filterSetId)
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
          New Card
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
            value={form.cardName}
            onChange={(v) => setField("cardName", v)}
            placeholder="Charizard ex"
            isDark={isDark}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Card Number (optional)"
              value={form.cardNumber}
              onChange={(v) => setField("cardNumber", v)}
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
          <div className="flex gap-6">
            <ToggleField
              label="Active"
              value={form.isActive}
              onChange={(v) => setField("isActive", v)}
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

      {loading ? (
        <div
          data-ocid="catalog.cards.loading_state"
          className="flex justify-center py-12"
        >
          <Loader2 size={20} className="animate-spin" color="#1f9d84" />
        </div>
      ) : filteredCards.length === 0 ? (
        <div
          data-ocid="catalog.cards.empty_state"
          className="py-12 text-center"
          style={{ color: textSecondary, fontSize: "13px" }}
        >
          No cards yet. Create your first one.
        </div>
      ) : (
        <div className="flex flex-col gap-2" data-ocid="catalog.cards.list">
          {filteredCards.map((card, i) => (
            <motion.div
              key={String(card.id)}
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
                      {card.cardName}
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: textSecondary,
                        fontFamily: "monospace",
                      }}
                    >
                      {card.cardNumber && `#${card.cardNumber} · `}
                      {card.rarity && `${card.rarity} · `}
                      {setNameMap[String(Number(card.setId))] ?? "Unknown Set"}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <ActiveBadge active={card.isActive} />
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
                    onClick={() => toggleActive(card)}
                  >
                    {card.isActive ? (
                      <ToggleRight size={13} />
                    ) : (
                      <ToggleLeft size={13} />
                    )}
                    {card.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.cards.secondary_button.${i + 1}`}
                    style={OUTLINE_BTN(isDark)}
                    onClick={() => toggleSupported(card)}
                  >
                    {card.isSupported ? "Unsupport" : "Mark Supported"}
                  </button>
                  <button
                    type="button"
                    data-ocid={`catalog.cards.delete_button.${i + 1}`}
                    style={DELETE_BTN}
                    onClick={() => deleteCard(card)}
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
  const { actor, isFetching } = useActor();
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

        {/* Tab content */}
        {isFetching || !actor ? (
          <div
            data-ocid="catalog.loading_state"
            className="flex justify-center py-16"
          >
            <Loader2 size={24} className="animate-spin" color="#1f9d84" />
          </div>
        ) : (
          <>
            {activeTab === "categories" && (
              <CategoriesTab isDark={isDark} actor={actor} />
            )}
            {activeTab === "sets" && <SetsTab isDark={isDark} actor={actor} />}
            {activeTab === "cards" && (
              <CardsTab isDark={isDark} actor={actor} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
