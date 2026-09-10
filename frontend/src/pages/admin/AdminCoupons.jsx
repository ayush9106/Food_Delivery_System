import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaStore, FaUtensils, FaListAlt, FaClipboardList,
  FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt,
  FaPlus, FaEdit, FaTrashAlt, FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/ui/Modal";
import { formatINR, formatDate, getErrorMessage } from "../../utils/helpers";
import { ADMIN_NAV } from "../../config/navigation";

const EMPTY = {
  code: "", description: "", type: "percent", value: "", minOrderAmount: "", maxDiscount: "",
  validFrom: "", validTo: "", usageLimit: "", isActive: true,
};

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminCoupons = () => {
  useDocumentTitle("Manage Coupons");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/coupons");
      setCoupons(r.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, validFrom: toLocalInput(new Date().toISOString()), validTo: toLocalInput(new Date(Date.now() + 30 * 86400000).toISOString()) });
    setModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description || "", type: c.type, value: c.value,
      minOrderAmount: c.minOrderAmount || "", maxDiscount: c.maxDiscount || "",
      validFrom: toLocalInput(c.validFrom), validTo: toLocalInput(c.validTo),
      usageLimit: c.usageLimit || "", isActive: c.isActive,
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return toast.error("Code and value are required");
    setSaving(true);
    const payload = {
      ...form,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      validFrom: new Date(form.validFrom).toISOString(),
      validTo: new Date(form.validTo).toISOString(),
    };
    try {
      if (editing) {
        await api.put(`/coupons/${editing.id}`, payload);
        toast.success("Coupon updated");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created");
      }
      setModal(false);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save coupon"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.info("Coupon deleted");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed"));
    }
  };

  const active = coupons.filter((c) => c.isActive).length;

  return (
    <DashboardLayout title="Manage Coupons" items={ADMIN_NAV} loading={loading} loaderLabel="Loading coupons...">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">{coupons.length} coupons · {active} active</p>
        <button onClick={openAdd} className="btn-primary">
          <FaPlus className="text-sm" /> Add coupon
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.id} className="card card-hover flex flex-col p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-orange-100 px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-orange-700">
                {c.code}
              </span>
              {c.isActive ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><FaCheckCircle /> Active</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400"><FaTimesCircle /> Inactive</span>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {c.type === "percent" ? `${c.value}% off` : `${formatINR(c.value)} off`}
              {c.maxDiscount ? ` · max ${formatINR(c.maxDiscount)}` : ""}
            </p>
            {c.description && <p className="mt-1 text-xs text-slate-500">{c.description}</p>}
            <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <p>Min order: {formatINR(c.minOrderAmount || 0)}</p>
              <p>Valid: {formatDate(c.validFrom)} → {formatDate(c.validTo)}</p>
              <p>Used: {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</p>
            </div>
            <div className="mt-auto flex gap-2 pt-4">
              <button onClick={() => openEdit(c)} className="flex-1 rounded-lg bg-orange-50 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100">
                <FaEdit className="mr-1 inline" /> Edit
              </button>
              <button onClick={() => remove(c.id)} className="flex-1 rounded-lg bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                <FaTrashAlt className="mr-1 inline" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit coupon" : "Add coupon"} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Coupon code *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field uppercase" placeholder="e.g. FOODIE20" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{form.type === "percent" ? "Value (%) *" : "Value (₹) *"}</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Min order (₹)</label>
              <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Max discount (₹)</label>
              <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Usage limit</label>
              <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Valid from *</label>
              <input type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Valid to *</label>
              <input type="datetime-local" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="e.g. Flat 20% off on orders above ₹199" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-orange-500" />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : editing ? "Update coupon" : "Add coupon"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminCoupons;
