import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Bell, Lock, Globe, Save, Loader2 } from "lucide-react";

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const sections = [
    {
      icon: Shield,
      title: "General Settings",
      description: "Manage your store general settings",
      fields: [
        { label: "Store Name", value: "LudoKingdom", type: "text" },
        { label: "Store Email", value: "admin@ludokingdom.com", type: "email" },
        { label: "Store Phone", value: "+233 55 123 4567", type: "tel" },
      ],
    },
    {
      icon: Globe,
      title: "Shipping Settings",
      description: "Configure shipping options",
      fields: [
        { label: "Default Shipping Fee (GH₵)", value: "0.00", type: "number" },
        {
          label: "Free Shipping Threshold (GH₵)",
          value: "500",
          type: "number",
        },
      ],
    },
    {
      icon: Bell,
      title: "Notification Settings",
      description: "Manage email notifications",
      fields: [
        { label: "Order Confirmation", value: true, type: "checkbox" },
        { label: "Payment Confirmation", value: true, type: "checkbox" },
        { label: "New User Registration", value: false, type: "checkbox" },
      ],
    },
    {
      icon: Lock,
      title: "Security Settings",
      description: "Manage security preferences",
      fields: [
        { label: "Two-Factor Authentication", value: false, type: "checkbox" },
        { label: "Session Timeout (minutes)", value: "60", type: "number" },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 p-5 border-b border-gray-200">
              <div className="p-2 bg-gray-100 rounded-lg">
                <section.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {section.fields.map((field, i) => (
                <div key={i}>
                  {field.type === "checkbox" ? (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={field.value as boolean}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-700">
                        {field.label}
                      </span>
                    </label>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        defaultValue={field.value as string}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg text-sm"
          >
            Settings saved successfully!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Settings;
