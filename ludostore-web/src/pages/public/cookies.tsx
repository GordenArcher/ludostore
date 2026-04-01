import { motion } from "framer-motion";
import {
  Cookie,
  Info,
  Settings,
  Activity,
  Shield,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";

const Cookies = () => {
  const lastUpdated = "April 1, 2026";

  const cookieTypes = [
    {
      icon: Activity,
      title: "Essential Cookies",
      description: "Required for the website to function properly",
      examples: [
        "Authentication",
        "Shopping cart",
        "Security",
        "Session management",
      ],
      duration: "Session / Persistent",
    },
    {
      icon: Settings,
      title: "Functional Cookies",
      description: "Remember your preferences and enhance functionality",
      examples: [
        "Language preferences",
        "Saved items",
        "User preferences",
        "Search history",
      ],
      duration: "1 year",
    },
    {
      icon: Activity,
      title: "Analytics Cookies",
      description: "Help us understand how visitors interact with our site",
      examples: [
        "Google Analytics",
        "Page views",
        "User behavior",
        "Traffic sources",
      ],
      duration: "2 years",
    },
    {
      icon: Shield,
      title: "Marketing Cookies",
      description: "Used to deliver relevant advertisements",
      examples: [
        "Retargeting",
        "Ad performance",
        "User interests",
        "Campaign tracking",
      ],
      duration: "90 days",
    },
  ];

  const howToManage = [
    {
      browser: "Chrome",
      steps: [
        "Click the three dots in the top right",
        "Go to Settings → Privacy and Security",
        "Click Cookies and other site data",
        "Adjust your cookie preferences",
      ],
    },
    {
      browser: "Firefox",
      steps: [
        "Click the menu button (three lines)",
        "Go to Settings → Privacy & Security",
        "Under Cookies and Site Data, adjust preferences",
        "Use 'Manage Data' for specific sites",
      ],
    },
    {
      browser: "Safari",
      steps: [
        "Go to Safari → Preferences",
        "Click Privacy tab",
        "Adjust 'Cookies and website data' settings",
        "Choose your preferred option",
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
            <Cookie className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Cookie Policy
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Learn how we use cookies and similar technologies to improve your
            experience.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-sm">
            <RefreshCw className="w-3 h-3" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#1e1e1e] rounded-xl border border-white/10 p-6 mb-8"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-gray-300 leading-relaxed">
                This Cookie Policy explains what cookies are, how we use them,
                and your choices regarding their use. By continuing to use our
                website, you consent to our use of cookies as described in this
                policy.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1e1e1e] rounded-xl border border-white/10 p-6 mb-6"
        >
          <h2 className="text-white font-semibold text-lg mb-3">
            What Are Cookies?
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Cookies are small text files that are placed on your device when you
            visit a website. They help the website remember your actions and
            preferences over time, making your browsing experience smoother and
            more personalized.
          </p>
        </motion.div>

        <div className="space-y-4 mb-8">
          <h2 className="text-white font-semibold text-lg mb-3">
            Types of Cookies We Use
          </h2>
          {cookieTypes.map((type, index) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#1a1a1a]">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <type.icon className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{type.title}</h3>
                  <p className="text-gray-500 text-xs">{type.description}</p>
                </div>
                <span className="text-gray-500 text-xs">{type.duration}</span>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {type.examples.map((example, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#2a2a2a] text-gray-400 px-2 py-1 rounded"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <h2 className="text-white font-semibold text-lg mb-4">
            How to Manage Cookies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {howToManage.map((browser) => (
              <div
                key={browser.browser}
                className="bg-[#1e1e1e] rounded-xl border border-white/10 p-4"
              >
                <h3 className="text-white font-medium mb-3">
                  {browser.browser}
                </h3>
                <ul className="space-y-2">
                  {browser.steps.map((step, i) => (
                    <li
                      key={i}
                      className="text-gray-400 text-xs flex items-start gap-2"
                    >
                      <span className="text-yellow-500">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1e1e1e] rounded-xl border border-white/10 p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-white font-medium mb-2">
                Third-Party Cookies
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We use third-party services like Google Analytics and Paystack
                that may place cookies on your device. These services have their
                own privacy policies, and we do not have control over their
                cookie settings.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[#1e1e1e] rounded-xl border border-white/10 p-6 text-center"
        >
          <h3 className="text-white font-semibold text-lg mb-2">
            Questions About Cookies?
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            If you have any questions about our use of cookies, please contact
            us.
          </p>
          <a
            href="mailto:privacy@ludokingdom.com"
            className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            privacy@ludokingdom.com
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Cookies;
