import { useEffect, useRef, useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaStore, FaUtensils, FaListAlt, FaClipboardList,
  FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt,
  FaPlus, FaEdit, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaCamera,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/ui/Modal";
import { formatINR, formatDate, getErrorMessage } from "../../utils/helpers";
import { ADMIN_NAV } from "../../config/navigation";

const EMPTY = {
  title: "", description: "", discountPercent: "", minOrderAmount: "", maxDiscount: "",
  code: "", validFrom: "", validTo: "", isActive: true,
};

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminOffers = () => {
  useDocumentTitle("Manage Offers");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/offers/admin/all");
      setOffers(r.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, validFrom: toLocalInput(new Date().toISOString()), validTo: toLocalInput(new Date(Date.now() + 30 * 86400000).toISOString()) });
    setImageFile(null);
    setModal(true);
  };

  const openEdit = (o) => {
    setEditing(o);
    setForm({
      title: o.title, description: o.description || "", discountPercent: o.discountPercent || "",
      minOrderAmount: o.minOrderAmount || "", maxDiscount: o.maxDiscount || "",
      code: o.code || "", validFrom: toLocalInput(o.validFrom), validTo: toLocalInput(o.validTo),
      isActive: o.isActive,
    });
    setImageFile(null);
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Offer title is required");
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== "" && fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);
    try {
      if (editing) {
        await api.put(`/offers/admin/${editing.id}`, fd);
        toast.success("Offer updated");
      } else {
        await api.post("/offers/admin", fd);
        toast.success("Offer created");
      }
      setModal(false);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save offer"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    try {
      await api.delete(`/offers/admin/${id}`);
      toast.info("Offer deleted");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <DashboardLayout title="Manage Offers" items={ADMIN_NAV} loading={loading} loaderLabel="Loading offers...">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">Promotional offers shown to customers on the Offers page.</p>
        <button onClick={openAdd} className="btn-primary">
          <FaPlus className="text-sm" /> Add offer
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => (
          <div key={o.id} className="card card-hover overflow-hidden">
            <div className="relative h-36">
              <img src={o.image || `https://via.placeholder.com/400?text=${encodeURIComponent(o.title)}`} alt={o.title} className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white">
                {o.discountPercent}% OFF
              </span>
              {o.isActive ? (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-emerald-600"><FaCheckCircle /> Active</span>
              ) : (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-400"><FaTimesCircle /> Inactive</span>
              )}
            </div>
            <div className="p-4">
              <p className="font-bold text-slate-900">{o.title}</p>
              {o.description && <p className="mt-1 text-xs text-slate-500">{o.description}</p>}
              <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <p>Min order: {formatINR(o.minOrderAmount || 0)}{o.maxDiscount ? ` · Max ${formatINR(o.maxDiscount)}` : ""}</p>
                {o.code && <p className="font-mono text-orange-600">Code: {o.code}</p>}
                <p>Valid: {formatDate(o.validFrom)} → {formatDate(o.validTo)}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(o)} className="flex-1 rounded-lg bg-orange-50 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100">
                  <FaEdit className="mr-1 inline" /> Edit
                </button>
                <button onClick={() => remove(o.id)} className="flex-1 rounded-lg bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                  <FaTrashAlt className="mr-1 inline" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit offer" : "Add offer"} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Offer title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Flat 20% OFF on first order" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Discount (%) *</label>
              <input type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Promo code</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" placeholder="e.g. WELCOME20" />
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
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows="2" />
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm text-slate-500 hover:border-orange-300">
              <FaCamera /> {imageFile ? imageFile.name : "Upload offer image"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-orange-500" />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : editing ? "Update offer" : "Add offer"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminOffers;
