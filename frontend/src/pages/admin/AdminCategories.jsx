import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaStore, FaUtensils, FaListAlt, FaClipboardList,
  FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt,
  FaPlus, FaEdit, FaTrashAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/ui/Modal";
import { getErrorMessage } from "../../utils/helpers";
import { ADMIN_NAV } from "./AdminDashboard";

const AdminCategories = () => {
  useDocumentTitle("Manage Categories");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/categories");
      setCategories(r.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, { name, isActive });
        toast.success("Category updated");
      } else {
        await api.post("/categories", { name, isGlobal: true });
        toast.success("Global category created");
      }
      setModal(false);
      setName("");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this global category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.info("Category deleted");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <DashboardLayout title="Manage Categories" items={ADMIN_NAV} loading={loading} loaderLabel="Loading categories...">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">Global categories shown to customers while browsing.</p>
        <button onClick={() => { setEditing(null); setName(""); setIsActive(true); setModal(true); }} className="btn-primary">
          <FaPlus className="text-sm" /> Add category
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="card card-hover flex items-center justify-between p-4">
            <div>
              <p className="font-bold text-slate-900">{c.name}</p>
              <p className={`text-xs ${c.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                {c.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(c); setName(c.name); setIsActive(c.isActive); setModal(true); }} className="rounded-lg bg-orange-50 p-2 text-orange-700 hover:bg-orange-100">
                <FaEdit />
              </button>
              <button onClick={() => remove(c.id)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit category" : "Add global category"} size="sm">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Category name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g. Pizza, Burgers, Biryani" />
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-orange-500" />
              Active
            </label>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminCategories;
