import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ticketsApi } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { Loader2, Plus, ArrowLeft } from "lucide-react";

const CreateTicket = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    subject: "",
    description: "",
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: user.full_name || "",
        customer_email: user.email || "",
      }));
    }
  }, [user, isAuthenticated]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    const name = formData.customer_name.trim();
    if (!name) {
      newErrors.customer_name = "Customer name is required.";
    } else if (name.length > 120) {
      newErrors.customer_name = "Name cannot exceed 120 characters.";
    }

    const email = formData.customer_email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.customer_email = "Customer email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.customer_email = "Invalid email format.";
    }

    const subject = formData.subject.trim();
    if (!subject) {
      newErrors.subject = "Subject is required.";
    } else if (subject.length > 200) {
      newErrors.subject = "Subject cannot exceed 200 characters.";
    }

    const description = formData.description.trim();
    if (!description) {
      newErrors.description = "Description is required.";
    } else if (description.length > 5000) {
      newErrors.description = "Description cannot exceed 5000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when editing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const res = await ticketsApi.createTicket({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      });
      addToast(`Ticket ${res.ticket_id} created successfully!`, "success");
      navigate(`/tickets/${res.ticket_id}`);
    } catch (err) {
      addToast(err.message || "Failed to create ticket", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back Link */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Container */}
      <div className="neo-card p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white my-0">
            Create Support Ticket
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 font-semibold mt-1">
            File a new service request on behalf of a customer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Customer Name
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                maxLength={120}
                placeholder="Jane Smith"
                disabled={isAuthenticated}
                className={`neo-input text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.customer_name ? "border-rose-500! dark:border-rose-500! shadow-rose-500!" : ""
                }`}
              />
              {errors.customer_name && (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">{errors.customer_name}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Customer Email
              </label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                placeholder="jane.smith@example.com"
                disabled={isAuthenticated}
                className={`neo-input text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.customer_email ? "border-rose-500! dark:border-rose-500! shadow-rose-500!" : ""
                }`}
              />
              {errors.customer_email && (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">{errors.customer_email}</span>
              )}
            </div>
          </div>

          {/* Ticket Subject */}
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              maxLength={200}
              placeholder="e.g. Cannot complete transaction on checkout page"
              className={`neo-input text-base font-bold ${
                errors.subject ? "border-rose-500! dark:border-rose-500! shadow-rose-500!" : ""
              }`}
            />
            {errors.subject && (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">{errors.subject}</span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Description / Details
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={5000}
              rows={6}
              placeholder="Provide a comprehensive write-up of the issue reported by the customer..."
              className={`neo-input text-base font-bold resize-y min-h-[120px] ${
                errors.description ? "border-rose-500! dark:border-rose-500! shadow-rose-500!" : ""
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">{errors.description}</span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Maximum 5000 characters</span>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {formData.description.length}/5000
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="neo-btn-primary w-full text-base font-black uppercase tracking-wider"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating ticket...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
