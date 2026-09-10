import { useState, useEffect } from "react";
import {
  FaPlus, FaEdit, FaTrashAlt, FaHome,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/common/EmptyState";
import { getErrorMessage } from "../../utils/helpers";
import { CUSTOMER_NAV } from "../../config/navigation";

const EMPTY_FORM = { label: "Home", fullAddress: "", landmark: "", city: "", state: "", pincode: "", isDefault: false };

const Addresses = () => {
  useDocumentTitle("My Addresses");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/users/addresses");
      setAddresses(r.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (a) => { setEditing(a); setForm(a); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/users/addresses/${editing.id}`, form);
        toast.success("Address updated");
      } else {
        await api.post("/users/addresses", form);
        toast.success("Address added");
      }
      setModal(false);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save address"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      toast.info("Address deleted");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed"));
    }
  };

  const setDefault = async (id) => {
    try {
      await api.put(`/users/addresses/${id}`, { isDefault: true });
      await load();
      toast.success("Default address set");
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed"));
    }
  };

  return (
    <DashboardLayout title="My Addresses" items={CUSTOMER_NAV} loading={loading} loaderLabel="Loading addresses...">
      <div className="mb-6 flex justify-end">
        <button onClick={openAdd} className="btn-primary">
          <FaPlus className="text-sm" /> Add address
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState title="No saved addresses" message="Add a delivery address to speed up checkout." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700">
                  <FaHome /> {a.label}
                </span>
                {a.isDefault && <span className="badge bg-emerald-50 text-emerald-700">Default</span>}
              </div>
              <p className="mt-3 text-sm text-slate-600">{a.fullAddress}</p>
              <p className="text-sm text-slate-500">{a.city}{a.state ? `, ${a.state}` : ""} · {a.pincode}</p>
              {a.landmark && <p className="mt-1 text-xs text-slate-400">Landmark: {a.landmark}</p>}
              <div className="mt-4 flex items-center gap-2">
                <button onClick={() => openEdit(a)} className="btn-secondary px-3 py-1.5 text-xs">
                  <FaEdit className="text-xs" /> Edit
                </button>
                <button onClick={() => remove(a.id)} className="btn-ghost px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">
                  <FaTrashAlt className="text-xs" /> Delete
                </button>
                {!a.isDefault && (
                  <button onClick={() => setDefault(a.id)} className="btn-ghost ml-auto px-3 py-1.5 text-xs">
                    Set default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit address" : "Add address"} size="md">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Label</label>
              <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input-field">
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Pincode</label>
              <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Full address</label>
            <textarea value={form.fullAddress} onChange={(e) => setForm({ ...form, fullAddress: e.target.value })} className="input-field resize-none" rows="2" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Landmark (optional)</label>
            <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">City</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">State</label>
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="accent-orange-500" />
            Set as default address
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save address"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Addresses;
