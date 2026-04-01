import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  Database,
  Mail,
  Lock,
  Cookie,
  Globe,
  Clock,
} from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Personal information you provide (name, email, phone number, address)",
        "Payment information processed securely through our payment partners",
        "Order history and purchase information",
        "Device information and browsing behavior",
        "Communication preferences and feedback",
      ],
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "Process and fulfill your orders",
        "Communicate about your orders and account",
        "Improve our products and services",
        "Send marketing communications (with your consent)",
        "Prevent fraud and ensure security",
      ],
    },
    {
      icon: Shield,
      title: "Data Security",
      content: [
        "We use industry-standard encryption (SSL/TLS) for data transmission",
        "Payment data is processed by PCI-compliant payment providers",
        "Regular security audits and updates",
        "Access restricted to authorized personnel only",
        "We never store your full payment card details",
      ],
    },
    {
      icon: Cookie,
      title: "Cookies & Tracking",
      content: [
        "Essential cookies for site functionality",
        "Analytics cookies to improve user experience",
        "Marketing cookies for personalized ads",
        "You can manage cookie preferences in your browser settings",
        "Third-party cookies from payment and analytics providers",
      ],
    },
    {
      icon: Globe,
      title: "Third-Party Services",
      content: [
        "Paystack - payment processing",
        "Google Analytics - website analytics",
        "Social media platforms for sharing",
        "Email service providers for communications",
        "These services have their own privacy policies",
      ],
    },
    {
      icon: Eye,
      title: "Your Rights",
      content: [
        "Access your personal data",
        "Correct inaccurate information",
        "Request deletion of your data",
        "Opt-out of marketing communications",
        "Export your data in a portable format",
      ],
    },
  ];

  const lastUpdated = "April 1, 2026";

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your personal information.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-sm">
            <Clock className="w-3 h-3" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#1e1e1e] rounded-xl border border-white/10 p-6 mb-8"
        >
          <p className="text-gray-300 leading-relaxed">
            At LudoKingdom, we are committed to protecting your privacy and
            ensuring the security of your personal information. This Privacy
            Policy outlines how we collect, use, disclose, and safeguard your
            information when you visit our website or make a purchase from us.
          </p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-5 border-b border-white/10 bg-[#1a1a1a]">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <section.icon className="w-5 h-5 text-yellow-500" />
                </div>
                <h2 className="text-white font-semibold text-lg">
                  {section.title}
                </h2>
              </div>
              <div className="p-5">
                <ul className="space-y-2">
                  {section.content.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-400 text-sm"
                    >
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-[#1e1e1e] rounded-xl border border-white/10 p-6 text-center"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/10 rounded-full mb-4">
            <Mail className="w-6 h-6 text-yellow-500" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Questions About Privacy?
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            If you have any questions about this Privacy Policy or how we handle
            your data, please contact us.
          </p>
          <a
            href="mailto:privacy@ludokingdom.com"
            className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            privacy@ludokingdom.com
            <Mail className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
