import { useState } from "react";
import {
  FaLock,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getErrorMessage } from "../../utils/helpers";
import { CUSTOMER_NAV } from "../../config/navigation";

const ChangePassword = () => {
  useDocumentTitle("Change Password");
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error("New passwords do not match");
    if (form.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Change failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Change Password" items={CUSTOMER_NAV} loading={false}>
      <div className="card max-w-lg p-6">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-lg text-white shadow-soft">
          <FaLock />
        </span>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Current password</label>
            <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">New password</label>
            <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Confirm new password</label>
            <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-field" required />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ChangePassword;
