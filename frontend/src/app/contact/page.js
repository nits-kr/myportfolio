"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FiMail,
  FiUser,
  FiMessageSquare,
  FiDollarSign,
  FiCalendar,
  FiSend,
} from "react-icons/fi";

const serviceOptions = [
  { id: "full-stack", label: "Full-Stack Development" },
  { id: "performance", label: "Performance Optimization" },
  { id: "consulting", label: "Technical Consulting" },
  { id: "custom", label: "Custom Project" },
];

const budgetRanges = [
  "Under $2,500",
  "$2,500 - $5,000",
  "$5,000 - $10,000",
  "$10,000 - $25,000",
  "$25,000+",
];

const timelineOptions = [
  "ASAP (1-2 weeks)",
  "1 month",
  "2-3 months",
  "3+ months",
  "Flexible",
];

export default function ContactPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    budget: "",
    timeline: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const serviceParam = searchParams.get("service");
    const messageParam = searchParams.get("message");

    setFormData((prev) => ({
      ...prev,
      service: serviceParam || prev.service,
      message: messageParam || prev.message,
    }));
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Integrate with backend API
      console.log("Form submitted:", formData);

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        service: "",
        budget: "",
        timeline: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-5"
          >
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-4 py-2 rounded-pill mb-3">
              Get In Touch
            </span>
            <h1 className="display-4 fw-bold mb-4">
              Let's Discuss Your <span className="text-primary">Project</span>
            </h1>
            <p className="lead text-muted">
              Fill out the form below and I'll get back to you within 24 hours.
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 p-md-5"
          >
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Name */}
                <div className="col-md-6">
                  <label className="form-label d-flex align-items-center gap-2">
                    <FiUser size={16} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control form-control-lg bg-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label className="form-label d-flex align-items-center gap-2">
                    <FiMail size={16} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control form-control-lg bg-transparent"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Service Type */}
                <div className="col-12">
                  <label className="form-label d-flex align-items-center gap-2">
                    <FiMessageSquare size={16} />
                    Service Interested In *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="form-select form-select-lg bg-transparent"
                    required
                  >
                    <option value="" className="text-dark">
                      Select a service...
                    </option>
                    {serviceOptions.map((option) => (
                      <option
                        key={option.id}
                        value={option.id}
                        className="text-dark"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div className="col-md-6">
                  <label className="form-label d-flex align-items-center gap-2">
                    <FiDollarSign size={16} />
                    Project Budget *
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="form-select form-select-lg bg-transparent"
                    required
                  >
                    <option value="" className="text-dark">
                      Select budget range...
                    </option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range} className="text-dark">
                        {range}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Timeline */}
                <div className="col-md-6">
                  <label className="form-label d-flex align-items-center gap-2">
                    <FiCalendar size={16} />
                    Desired Timeline *
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="form-select form-select-lg bg-transparent"
                    required
                  >
                    <option value="" className="text-dark">
                      Select timeline...
                    </option>
                    {timelineOptions.map((option) => (
                      <option key={option} value={option} className="text-dark">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="col-12">
                  <label className="form-label d-flex align-items-center gap-2">
                    <FiMessageSquare size={16} />
                    Project Details *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-control bg-transparent"
                    rows="6"
                    placeholder="Tell me about your project, goals, and any specific requirements..."
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="col-12">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend />
                        Send Inquiry
                      </>
                    )}
                  </button>
                </div>

                {/* Status Messages */}
                {submitStatus === "success" && (
                  <div className="col-12">
                    <div className="alert alert-success d-flex align-items-center gap-2 mb-0">
                      <FiMessageSquare />
                      Thank you! I'll review your inquiry and get back to you
                      within 24 hours.
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="col-12">
                    <div className="alert alert-danger mb-0">
                      Something went wrong. Please try again or email me
                      directly.
                    </div>
                  </div>
                )}
              </div>
            </form>
          </motion.div>

          {/* Additional Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-5"
          >
            <p className="text-muted">
              Prefer email? Reach me at{" "}
              <a
                href="mailto:hello@example.com"
                className="text-primary text-decoration-none"
              >
                hello@example.com
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
