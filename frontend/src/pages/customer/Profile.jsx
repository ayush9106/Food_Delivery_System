import { useState, useRef } from "react";
import {
  FaCamera,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getErrorMessage } from "../../utils/helpers";
import { CUSTOMER_NAV } from "../../config/navigation";

const Profile = () => {
  useDocumentTitle("My Profile");
  const { user, setUser, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/users/profile", form);
      setUser({ ...user, name: data.data.name, phone: data.data.phone });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const { data } = await api.patch("/users/profile-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser({ ...user, profileImage: data.data.profileImage });
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <DashboardLayout title="My Profile" items={CUSTOMER_NAV} loading={false}>
      <div className="card p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
          <div className="relative">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-orange-100" />
            ) : (
              <span className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-3xl font-bold text-white ring-4 ring-orange-100">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-orange-500 text-white shadow-soft transition-transform hover:scale-105 disabled:opacity-50"
              title="Change photo"
            >
              <FaCamera />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          </div>
          <div className="mt-4 text-center sm:mt-0 sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm capitalize text-slate-500">{user?.role?.replace(/_/g, " ")} · {user?.email}</p>
            {uploading && <p className="mt-1 text-xs text-orange-600">Uploading...</p>}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={saveProfile} className="mt-8 max-w-lg space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email (cannot be changed)</label>
            <input value={user?.email || ""} disabled className="input-field bg-slate-50 text-slate-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
