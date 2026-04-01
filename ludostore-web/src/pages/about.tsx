import { motion } from "framer-motion";
import {
  Gamepad2,
  Target,
  Heart,
  Users,
  Award,
  Clock,
  Package,
  Star,
} from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Passion for Gaming",
      description:
        "We're gamers at heart, dedicated to bringing joy to game nights across Ghana.",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description:
        "We source only the highest quality products from trusted manufacturers.",
    },
    {
      icon: Users,
      title: "Customer First",
      description:
        "Your satisfaction is our priority. We're here to help every step of the way.",
    },
    {
      icon: Target,
      title: "Continuous Improvement",
      description:
        "We constantly evolve our collection to bring you the best products available.",
    },
  ];

  const stats = [
    { value: "10,000+", label: "Happy Customers", icon: Users },
    { value: "50+", label: "Products", icon: Package },
    { value: "99%", label: "Satisfaction Rate", icon: Star },
    { value: "24/7", label: "Support", icon: Clock },
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
            <Gamepad2 className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            About LudoKingdom
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your trusted destination for premium Ludo products in Ghana.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#1e1e1e] rounded-xl border border-white/10 p-6 mb-8"
        >
          <h2 className="text-white font-semibold text-xl mb-3">Our Story</h2>
          <p className="text-gray-400 leading-relaxed">
            Founded in 2024, LudoKingdom was born from a simple idea: to bring
            the joy of quality Ludo gaming to every home in Ghana. What started
            as a passion project has grown into Ghana's premier destination for
            Ludo boards, dice sets, and accessories.
          </p>
          <p className="text-gray-400 leading-relaxed mt-4">
            We believe that game nights bring families and friends closer
            together. That's why we're committed to providing premium products
            that make every game night memorable. From classic wooden boards to
            modern LED sets, we curate only the best for our customers.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-[#1e1e1e] rounded-xl border border-white/10 p-4 text-center"
            >
              <stat.icon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1e1e1e] rounded-xl border border-white/10 p-6"
          >
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Our Mission
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              To provide Ghanaian families with premium Ludo products that
              create lasting memories and bring people together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[#1e1e1e] rounded-xl border border-white/10 p-6"
          >
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Our Vision
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              To become Ghana's most trusted destination for quality gaming
              products and accessories.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-white font-semibold text-xl mb-4 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="bg-[#1e1e1e] rounded-xl border border-white/10 p-5 hover:border-yellow-500/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <value.icon className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h3 className="text-white font-semibold">{value.title}</h3>
                </div>
                <p className="text-gray-400 text-sm pl-11">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
