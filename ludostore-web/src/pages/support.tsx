import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Truck,
  RotateCcw,
  CreditCard,
  Mail,
  MessageCircle,
  Link,
} from "lucide-react";

const Support = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "faq");

  const tabs = [
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "returns", label: "Returns", icon: RotateCcw },
    { id: "payment", label: "Payment", icon: CreditCard },
  ];

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab]);

  const faqItems = [
    {
      question: "How do I place an order?",
      answer:
        "Simply browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or login to complete your purchase.",
    },
    {
      question: "Do I need an account to order?",
      answer:
        "You can checkout as a guest, but creating an account allows you to track orders, save addresses, and manage your wishlist.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order is shipped, you'll receive a tracking number via email. You can also track your order in your account dashboard under 'My Orders'.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept card payments via Paystack (Visa, Mastercard, Mobile Money) and Cash on Delivery for selected areas.",
    },
    {
      question: "Can I cancel my order?",
      answer:
        "Orders can be cancelled within 1 hour of placement if they haven't been processed. Contact support immediately for cancellation requests.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Currently, we only ship within Ghana. We're working on expanding to other countries soon.",
    },
  ];

  const shippingInfo = {
    title: "Shipping Information",
    sections: [
      {
        title: "Delivery Areas",
        content:
          "We currently deliver to all regions within Ghana, including Greater Accra, Ashanti, Western, Eastern, Central, Volta, Northern, Upper East, and Upper West regions.",
      },
      {
        title: "Delivery Times",
        content:
          "Orders are processed within 1-2 business days. Delivery times vary by location:\n• Accra/Tema: 1-2 business days\n• Regional Capitals: 2-4 business days\n• Other areas: 3-7 business days",
      },
      {
        title: "Shipping Costs",
        content:
          "Shipping costs are calculated at checkout based on your location and order value. Orders over GH₵ 500 qualify for free shipping.",
      },
      {
        title: "Order Tracking",
        content:
          "Once your order ships, you'll receive a tracking number via SMS and email. You can track your order on our website under 'My Orders'.",
      },
    ],
  };

  const returnsInfo = {
    title: "Returns & Refunds",
    sections: [
      {
        title: "Return Policy",
        content:
          "We accept returns within 7 days of delivery for defective or incorrect items. Products must be unused and in original packaging.",
      },
      {
        title: "How to Return",
        content:
          "1. Contact our support team with your order number and reason for return\n2. We'll provide a return authorization\n3. Pack the item securely\n4. Drop off at designated location or arrange pickup",
      },
      {
        title: "Refund Process",
        content:
          "Refunds are processed within 7-14 business days after we receive and inspect the returned item. Refunds are issued via the original payment method.",
      },
      {
        title: "Non-Returnable Items",
        content:
          "The following items cannot be returned:\n• Items with damaged packaging\n• Items with missing parts\n• Items purchased on final sale",
      },
    ],
  };

  const paymentInfo = {
    title: "Payment Methods",
    sections: [
      {
        title: "Paystack (Card & Mobile Money)",
        content:
          "We accept all major cards (Visa, Mastercard, American Express) and mobile money (MTN MoMo, Vodafone Cash, AirtelTigo Money) through our secure payment partner, Paystack.",
      },
      {
        title: "Cash on Delivery",
        content:
          "Pay when your order arrives. Available for orders within Ghana. A small COD fee may apply.",
      },
      {
        title: "Payment Security",
        content:
          "All transactions are encrypted and processed securely. We never store your payment details on our servers.",
      },
      {
        title: "Payment Issues",
        content:
          "If you experience payment issues, contact us immediately. Do not attempt multiple payments. We'll help resolve the issue.",
      },
    ],
  };

  const renderContent = () => {
    switch (activeTab) {
      case "faq":
        return (
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1e1e1e] rounded-xl border border-white/10 p-5 hover:border-yellow-500/50 transition-colors"
              >
                <h3 className="text-white font-semibold mb-2 flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {item.question}
                </h3>
                <p className="text-gray-400 text-sm pl-7">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        );

      case "shipping":
        return (
          <div className="space-y-6">
            {shippingInfo.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1e1e1e] rounded-xl border border-white/10 p-5"
              >
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-yellow-500" />
                  {section.title}
                </h3>
                <p className="text-gray-400 text-sm whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        );

      case "returns":
        return (
          <div className="space-y-6">
            {returnsInfo.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1e1e1e] rounded-xl border border-white/10 p-5"
              >
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-yellow-500" />
                  {section.title}
                </h3>
                <p className="text-gray-400 text-sm whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            {paymentInfo.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1e1e1e] rounded-xl border border-white/10 p-5"
              >
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-yellow-500" />
                  {section.title}
                </h3>
                <p className="text-gray-400 text-sm whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Support Center
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions and learn about our policies.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-yellow-500 text-gray-900 font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 p-6 bg-[#1e1e1e] rounded-xl border border-white/10 text-center">
          <MessageCircle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">
            Still Need Help?
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Our support team is ready to assist you.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            Contact Us
            <Mail className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Support;
