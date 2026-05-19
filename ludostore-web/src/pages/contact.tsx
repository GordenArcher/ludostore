import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  isContactEmailConfigured,
  sendContactMessage,
} from "../api/contact";
import { Spinner } from "../components/loading/Spinner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!isContactEmailConfigured()) {
        throw new Error(
          "Contact email is not configured yet. Please use phone or WhatsApp for now.",
        );
      }

      await sendContactMessage(formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: [
        {
          label: "support@amfoartgallery.com",
          href: "mailto:support@amfoartgallery.com",
        },
        {
          label: "orders@amfoartgallery.com",
          href: "mailto:orders@amfoartgallery.com",
        },
      ],
    },
    {
      icon: Phone,
      title: "Call Us",
      details: [{ label: "024 858 4625", href: "tel:+233248584625" }],
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      details: [
        { label: "024 858 4625", href: "https://wa.me/233248584625" },
      ],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        { label: "Monday - Friday: 9am - 6pm" },
        { label: "Saturday: 10am - 4pm" },
        { label: "Sunday: Closed" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mb-4">
            <Mail className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Contact Us
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-[#1e1e1e] rounded-xl border border-white/10 p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <info.icon className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h3 className="text-white font-semibold">{info.title}</h3>
                </div>
                <div className="space-y-1 pl-11">
                  {info.details.map((detail, i) =>
                    "href" in detail ? (
                      <a
                        key={i}
                        href={detail.href}
                        className="text-gray-400 text-sm hover:text-yellow-500 transition-colors block"
                      >
                        {detail.label}
                      </a>
                    ) : (
                      <p key={i} className="text-gray-400 text-sm">
                        {detail.label}
                      </p>
                    ),
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-[#1e1e1e] rounded-xl border border-white/10 p-6"
          >
            <h2 className="text-white font-semibold text-lg mb-4">
              Send a Message
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-96 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-2">
                  Message sent successfully
                </h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  We'll get back to you soon. The contact form will return in a
                  moment.
                </p>
              </motion.div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <Spinner size="lg" color="white" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
