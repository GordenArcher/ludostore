import { Link } from "react-router-dom";
import {
  Gamepad2,
  Mail,
  Phone,
  MapPin,
  Send,
  Shield,
  Truck,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
} from "./socialIcons";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const supportLinks = [
    { name: "Support Center", path: "/support" },
    { name: "FAQ", path: "/support?tab=faq" },
    { name: "Shipping Info", path: "/support?tab=shipping" },
    { name: "Returns", path: "/support?tab=returns" },
    { name: "Payment Methods", path: "/support?tab=payment" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookie Policy", path: "/cookies" },
  ];

  const features = [
    { icon: Shield, text: "Secure Payments" },
    { icon: Truck, text: "Fast Delivery" },
    { icon: RotateCcw, text: "Easy Returns" },
    { icon: CreditCard, text: "Multiple Payment Options" },
  ];

  const socialLinks = [
    { icon: FacebookIcon, href: "https://facebook.com", label: "Facebook" },
    { icon: TwitterIcon, href: "https://twitter.com", label: "Twitter" },
    { icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
    { icon: YoutubeIcon, href: "https://youtube.com", label: "YouTube" },
  ];

  return (
    <footer className="bg-[#0f0f0f] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <Gamepad2 className="w-8 h-8 text-yellow-500" />
              <span className="text-white font-bold text-xl">
                Ludo<span className="text-yellow-500">Kingdom</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your premier destination for premium Ludo boards, dice sets, and
              accessories. Elevate your game nights with our handpicked
              collection.
            </p>
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#1e1e1e] hover:bg-yellow-500/20 rounded-lg transition-colors cursor-pointer"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-gray-400 hover:text-yellow-500 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-yellow-500 text-sm transition-colors cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-yellow-500 text-sm transition-colors cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Stay Updated
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get special offers and updates.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-[#1e1e1e] border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
              />
              <button
                type="submit"
                className="p-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-yellow-500" />
                <span>support@ludokingdom.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-yellow-500" />
                <span>+233 55 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-yellow-500" />
                <span>Accra, Ghana</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-2"
              >
                <feature.icon className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-400 text-xs">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {currentYear} LudoKingdom. All rights reserved.
          </p>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-500 hover:text-yellow-500 text-xs transition-colors cursor-pointer"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
