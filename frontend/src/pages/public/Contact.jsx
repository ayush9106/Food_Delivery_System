import { useState } from "react";
import { toast } from "react-toastify";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaPaperPlane, FaClock } from "react-icons/fa";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Contact = () => {
  useDocumentTitle("Contact Us");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return toast.error("Please fill in all required fields");
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent! We'll get back to you shortly.");
    }, 1200);
  };

  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Contact us</h1>
        <p className="mt-2 text-slate-500">Questions, feedback or partnership ideas — we'd love to hear from you.</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        {/* Info */}
        <div className="space-y-4">
          {[
            { Icon: FaMapMarkerAlt, title: "Head office", text: "123 Foodie Street, Bengaluru, Karnataka 560001" },
            { Icon: FaPhone, title: "Call us", text: "+91 98765 43210" },
            { Icon: FaEnvelope, title: "Email", text: "support@foodie.app" },
            { Icon: FaClock, title: "Support hours", text: "Mon – Sun, 9am to 11pm" },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="card flex items-center gap-4 p-5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-lg text-white shadow-soft">
                <Icon />
              </span>
              <div>
                <p className="font-bold text-slate-900">{title}</p>
                <p className="text-sm text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="input-field"
              placeholder="How can we help?"
            />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows="5"
              className="input-field resize-none"
              placeholder="Write your message..."
            />
          </div>
          <button type="submit" disabled={sending} className="btn-primary mt-5">
            <FaPaperPlane className="text-sm" /> {sending ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
