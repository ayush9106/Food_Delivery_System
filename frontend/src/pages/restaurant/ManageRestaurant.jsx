import { useState, useEffect, useRef } from "react";
import {
  FaTachometerAlt, FaStore, FaUtensils, FaListAlt, FaClipboardList, FaChartBar,
  FaPlus, FaEdit, FaTrashAlt, FaCamera,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { getErrorMessage } from "../../utils/helpers";
import { OWNER_NAV } from "../../config/navigation";

const EMPTY = {
  name: "", description: "", cuisine: "", address: "", city: "", state: "",
  pincode: "", phone: "", deliveryFee: "", deliveryTime: 30, minOrderAmount: "",
};

const ManageRestaurant = () => {
  useDocumentTitle("My Restaurant");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef(null);
  const covRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/restaurants/owner/mine");
      setRestaurants(r.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setImageFile(null); setCoverFile(null); setModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ ...EMPTY, ...r });
    setImageFile(null);
    setCoverFile(null);
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== "" && fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);
    if (coverFile) fd.append("coverImage", coverFile);
    try {
      if (editing) {
        await api.put(`/restaurants/owner/${editing.id}`, fd);
        toast.success("Restaurant updated");
      } else {
        await api.post("/restaurants/owner", fd);
        toast.success("Restaurant created! Awaiting admin approval.");
      }
      setModal(false);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save restaurant"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this restaurant? This cannot be undone.")) return;
    try {
      await api.delete(`/restaurants/owner/${id}`);
      toast.info("Restaurant deleted");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <DashboardLayout title="My Restaurant" items={OWNER_NAV} loading={loading} loaderLabel="Loading restaurants...">
      <div className="mb-6 flex justify-end">
        <button onClick={openAdd} className="btn-primary">
          <FaPlus className="text-sm" /> Add restaurant
        </button>
      </div>

      <div className="space-y-4">
        {restaurants.map((r) => (
          <div key={r.id} className="card card-hover flex flex-wrap items-center gap-4 p-5">
            <img src={r.image || `https://via.placeholder.com/100?text=Restaurant`} alt={r.name} className="h-16 w-16 rounded-xl object-cover" />
            <div className="min-w-40 flex-1">
              <p className="font-bold text-slate-900">{r.name}</p>
              <p className="text-sm text-slate-500">{r.cuisine} · {r.city}, {r.state}</p>
              <p className="text-xs text-slate-400">{r.address}</p>
            </div>
            <StatusBadge status={r.status} />
            <div className="flex gap-2">
              <button onClick={() => openEdit(r)} className="btn-secondary px-3 py-2 text-xs">
                <FaEdit className="text-xs" /> Edit
              </button>
              <button onClick={() => remove(r.id)} className="btn-ghost px-3 py-2 text-xs text-red-500 hover:bg-red-50">
                <FaTrashAlt className="text-xs" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {restaurants.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
          No restaurants yet. Click "Add restaurant" to create your first one.
        </p>
      )}

      {/* Add / Edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit restaurant" : "Add restaurant"} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Restaurant name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Cuisine *</label>
              <input value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} className="input-field" placeholder="North Indian, Italian..." required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows="2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">City</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">State</label>
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Pincode</label>
              <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Delivery fee (₹)</label>
              <input type="number" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Delivery time (mins)</label>
              <input type="number" value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Min order (₹)</label>
              <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="input-field" />
            </div>
          </div>

          {/* Images */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Restaurant image</label>
              <button type="button" onClick={() => imgRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm text-slate-500 hover:border-orange-300">
                <FaCamera /> {imageFile ? imageFile.name : "Upload image"}
              </button>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Cover image</label>
              <button type="button" onClick={() => covRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm text-slate-500 hover:border-orange-300">
                <FaCamera /> {coverFile ? coverFile.name : "Upload cover"}
              </button>
              <input ref={covRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files[0])} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : editing ? "Update restaurant" : "Create restaurant"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageRestaurant;
