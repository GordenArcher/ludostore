import { motion } from "framer-motion";
import {
  FileText,
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  AlertCircle,
  Clock,
  RefreshCw,
  Scale,
} from "lucide-react";

const Terms = () => {
  const lastUpdated = "April 1, 2026";

  const sections = [
    {
      icon: Scale,
      title: "Acceptance of Terms",
      content: [
        "By accessing or using LudoKingdom, you agree to be bound by these Terms of Service.",
        "If you do not agree to these terms, please do not use our services.",
        "We reserve the right to modify these terms at any time. Changes become effective immediately upon posting.",
      ],
    },
    {
      icon: ShoppingBag,
      title: "Products & Pricing",
      content: [
        "All product descriptions, images, and prices are subject to change without notice.",
        "We strive to display accurate product information, but errors may occur.",
        "Prices are in Ghana Cedis (GH₵) and include applicable taxes.",
        "We reserve the right to cancel orders due to pricing errors or stock unavailability.",
      ],
    },
    {
      icon: CreditCard,
      title: "Payments",
      content: [
        "We accept payments via Paystack (cards, mobile money, bank transfers) and Cash on Delivery.",
        "All payments are processed securely through our payment partners.",
        "For Cash on Delivery, payment is made upon receipt of your order.",
        "You agree to provide accurate and complete payment information.",
      ],
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      content: [
        "Delivery times are estimates and not guaranteed.",
        "We ship to addresses within Ghana.",
        "Shipping costs will be calculated at checkout or on phone with our team based on your location",
        "You are responsible for providing accurate delivery information.",
        "Risk of loss passes to you upon delivery.",
      ],
    },
    {
      icon: RefreshCw,
      title: "Returns & Refunds",
      content: [
        "Returns are accepted within 7 days of delivery for defective products.",
        "Items must be unused and in original packaging.",
        "Return shipping costs are your responsibility unless the item is defective.",
        "Refunds are processed within 7-14 business days after receiving the return.",
        "Cash on Delivery orders are refunded via bank transfer or mobile money.",
      ],
    },
    {
      icon: Shield,
      title: "Account Responsibility",
      content: [
        "You are responsible for maintaining the security of your account.",
        "You agree to provide accurate and complete information.",
        "Notify us immediately of any unauthorized account use.",
        "We are not liable for losses caused by unauthorized account access.",
      ],
    },
    {
      icon: AlertCircle,
      title: "Prohibited Activities",
      content: [
        "Using our site for illegal purposes",
        "Attempting to interfere with site security or functionality",
        "Reselling products without authorization",
        "Providing false or misleading information",
        "Harassing other users or staff",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mb-4">
            <FileText className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Terms of Service
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Please read these terms carefully before using our services.
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
            Welcome to LudoKingdom. These Terms of Service govern your use of
            our website and services. By placing an order or using our site, you
            agree to be bound by these terms.
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
          transition={{ delay: 0.5 }}
          className="mt-8 bg-[#1e1e1e] rounded-xl border border-white/10 p-6 text-center"
        >
          <h3 className="text-white font-semibold text-lg mb-2">Contact Us</h3>
          <p className="text-gray-400 text-sm mb-4">
            If you have any questions about these Terms, please contact us.
          </p>
          <a
            href="mailto:legal@ludokingdom.com"
            className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            legal@ludokingdom.com
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
