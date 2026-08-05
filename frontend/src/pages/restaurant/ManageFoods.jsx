import { useState, useEffect, useRef } from "react";
import {
  FaTachometerAlt, FaStore, FaUtensils, FaListAlt, FaClipboardList, FaChartBar,
  FaPlus, FaEdit, FaTrashAlt, FaCamera, FaLeaf,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../../components/ui/Modal";
import { formatINR, getErrorMessage } from "../../utils/helpers";
import { OWNER_NAV } from "./OwnerDashboard";

const EMPTY = { restaurantId: "", name: "", description: "", price: "", discountPrice: "", categoryId: "", isVeg: true, isAvailable: true };

const ManageFoods = () => {
  useDocumentTitle("Manage Menu");
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      const r = await api.get("/restaurants/owner/mine");
      setRestaurants(r.data.data);
      if (r.data.data.length) {
        setSelectedRestaurant(r.data.data[0].id);
        loadFoods(r.data.data[0].id);
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const loadFoods = async (restaurantId) => {
    setLoading(true);
    try {
      const [f, c] = await Promise.all([
        api.get(`/restaurants/${restaurantId}`),
        api.get(`/categories/restaurant/${restaurantId}`),
      ]);
      setFoods(f.data.data.foods || []);
      setCategories(c.data.data);
    } finally {
      setLoading(false);
    }
  };

  const switchRestaurant = (id) => {
    setSelectedRestaurant(id);
    loadFoods(id);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, restaurantId: selectedRestaurant });
    setImageFile(null);
    setModal(true);
  };

  const openEdit = (food) => {
    setEditing(food);
    setForm({ ...EMPTY, ...food, restaurantId: food.restaurantId, categoryId: food.categoryId || "" });
    setImageFile(null);
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== "" && fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);
    try {
      if (editing) {
        await api.put(`/foods/owner/${editing.id}`, fd);
        toast.success("Food item updated");
      } else {
        await api.post("/foods/owner", fd);
        toast.success("Food item added");
      }
      setModal(false);
      await loadFoods(selectedRestaurant);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save food"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this food item?")) return;
    try {
      await api.delete(`/foods/owner/${id}`);
      toast.info("Food item deleted");
      await loadFoods(selectedRestaurant);
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed"));
    }
  };

  const toggleAvailable = async (food) => {
    try {
      await api.patch(`/foods/owner/${food.id}/availability`, { isAvailable: !food.isAvailable });
      await loadFoods(selectedRestaurant);
      toast.success(food.isAvailable ? "Marked unavailable" : "Marked available");
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed"));
    }
  };

  return (
    <DashboardLayout title="Manage Menu" items={OWNER_NAV} loading={loading} loaderLabel="Loading menu...">
      {/* Restaurant selector */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-700">Restaurant:</label>
        <select value={selectedRestaurant} onChange={(e) => switchRestaurant(e.target.value)} className="input-field w-64">
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button onClick={openAdd} className="btn-primary ml-auto">
          <FaPlus className="text-sm" /> Add food item
        </button>
      </div>

      {foods.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
          No items in this restaurant's menu yet. Click "Add food item" to get started.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => (
            <div key={food.id} className="card card-hover overflow-hidden">
              <div className="relative h-36">
                <img src={food.image || `https://via.placeholder.com/300?text=${encodeURIComponent(food.name)}`} alt={food.name} className="h-full w-full object-cover" />
                {!food.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="badge bg-red-500 text-white">Sold out</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{food.name}</p>
                    <p className="text-xs text-slate-500">{food.category?.name || "Uncategorised"}</p>
                  </div>
                  {food.isVeg && <FaLeaf className="text-emerald-500" />}
                </div>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatINR(food.discountPrice || food.price)}
                  {food.discountPrice && <span className="ml-1 text-xs text-slate-400 line-through">{formatINR(food.price)}</span>}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailable(food)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      food.isAvailable ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {food.isAvailable ? "In stock" : "Sold out"}
                  </button>
                  <button onClick={() => openEdit(food)} className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100">
                    <FaEdit className="mr-1 inline" /> Edit
                  </button>
                  <button onClick={() => remove(food.id)} className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
                    <FaTrashAlt className="mr-1 inline" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit food item" : "Add food item"} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Food name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Category</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                <option value="">Uncategorised</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Discount price (₹)</label>
              <input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Type</label>
              <select value={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.value === "true" })} className="input-field">
                <option value="true">Vegetarian</option>
                <option value="false">Non-vegetarian</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Availability</label>
              <select value={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.value === "true" })} className="input-field">
                <option value="true">Available</option>
                <option value="false">Sold out</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows="2" />
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm text-slate-500 hover:border-orange-300">
              <FaCamera /> {imageFile ? imageFile.name : "Upload food image"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : editing ? "Update item" : "Add item"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageFoods;
