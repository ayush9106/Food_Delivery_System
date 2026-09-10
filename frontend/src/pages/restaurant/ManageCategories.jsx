import { useState, useEffect } from "react";
import {
  FaTachometerAlt, FaStore, FaUtensils, FaListAlt, FaClipboardList, FaChartBar,
  FaPlus, FaEdit, FaTrashAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/ui/Modal";
import { getErrorMessage } from "../../utils/helpers";
import { OWNER_NAV } from "../../config/navigation";

const ManageCategories = () => {
  useDocumentTitle("Manage Categories");
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await api.get("/restaurants/owner/mine");
      setRestaurants(r.data.data);
      if (r.data.data.length) {
        setSelectedRestaurant(r.data.data[0].id);
        load(r.data.data[0].id);
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const load = async (id) => {
    setLoading(true);
    try {
      const r = await api.get(`/categories/restaurant/${id}`);
      setCategories(r.data.data);
    } finally {
      setLoading(false);
    }
  };

  const switchRestaurant = (id) => {
    setSelectedRestaurant(id);
    load(id);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, { name });
        toast.success("Category updated");
      } else {
        await api.post("/categories", { name, restaurantId: selectedRestaurant });
        toast.success("Category created");
      }
      setModal(false);
      setName("");
      setEditing(null);
      await load(selectedRestaurant);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.info("Category deleted");
      await load(selectedRestaurant);
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <DashboardLayout title="Manage Categories" items={OWNER_NAV} loading={loading} loaderLabel="Loading categories...">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-700">Restaurant:</label>
        <select value={selectedRestaurant} onChange={(e) => switchRestaurant(e.target.value)} className="input-field w-64">
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button onClick={() => { setEditing(null); setName(""); setModal(true); }} className="btn-primary ml-auto">
          <FaPlus className="text-sm" /> Add category
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="card card-hover flex items-center justify-between p-4">
            <div>
              <p className="font-bold text-slate-900">{c.name}</p>
              <p className="text-xs text-slate-500">{c.foods?.length || 0} items</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(c); setName(c.name); setModal(true); }} className="rounded-lg bg-orange-50 p-2 text-orange-700 hover:bg-orange-100">
                <FaEdit />
              </button>
              <button onClick={() => remove(c.id)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit category" : "Add category"} size="sm">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Category name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g. Starters, Main course" />
          </div>
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

export default ManageCategories;
