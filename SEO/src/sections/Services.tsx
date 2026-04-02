"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  Code,
  Server,
  GitBranch,
  Shield,
  ChevronRight,
  Bot,
  Cpu,
  Workflow,
  Laptop,
  Bug,
  Cable,
  Cloud,
  Eye,
  Database,
  Users,
  ShieldCheck,
  Lock as LockIcon,
} from "lucide-react";

interface ServiceFeature {
  text: string;
  icon: React.ReactNode;
}

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  features: ServiceFeature[];
  icon: React.ReactNode;
  gradient: string;
}

const services: ServiceCard[] = [
  {
    id: "ai",
    title: "AI & Smart Systems",
    description: "Transform your operations with custom artificial intelligence solutions that work offline and protect your data.",
    features: [
      { text: "Custom AI assistants", icon: <Bot size={14} /> },
      { text: "Edge AI (offline processing)", icon: <Cpu size={14} /> },
      { text: "Workflow automation", icon: <Workflow size={14} /> },
    ],
    icon: <Brain size={28} />,
    gradient: "from-purple-500 to-blue-500",
  },
  {
    id: "development",
    title: "Custom Development",
    description: "Bespoke software solutions built to your exact specifications, from concept to deployment.",
    features: [
      { text: "Full-stack development", icon: <Laptop size={14} /> },
      { text: "Debugging & optimization", icon: <Bug size={14} /> },
      { text: "System integration", icon: <Cable size={14} /> },
    ],
    icon: <Code size={28} />,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "servers",
    title: "Servers & Networking",
    description: "Enterprise-grade infrastructure setup and management tailored for small and medium businesses.",
    features: [
      { text: "LAN / VPN setup", icon: <Server size={14} /> },
      { text: "Linux / Windows servers", icon: <Cloud size={14} /> },
      { text: "Docker & Kubernetes", icon: <Users size={14} /> },
    ],
    icon: <Server size={28} />,
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    id: "automation",
    title: "Automation & DevOps",
    description: "Streamline your development pipeline with continuous integration and automated monitoring.",
    features: [
      { text: "CI/CD pipelines", icon: <GitBranch size={14} /> },
      { text: "Monitoring systems", icon: <Eye size={14} /> },
      { text: "Infrastructure automation", icon: <Database size={14} /> },
    ],
    icon: <GitBranch size={28} />,
    gradient: "from-teal-500 to-green-500",
  },
  {
    id: "security",
    title: "Cybersecurity",
    description: "Comprehensive security solutions to protect your data and systems from modern threats.",
    features: [
      { text: "Encryption & access control", icon: <Shield size={14} /> },
      { text: "Security audits", icon: <ShieldCheck size={14} /> },
      { text: "Data protection", icon: <LockIcon size={14} /> },
    ],
    icon: <Shield size={28} />,
    gradient: "from-orange-500 to-red-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="relative py-20 sm:py-32 bg-gradient-to-b from-[#0b0f1a] to-[#0f172a]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium rounded-full mb-4">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Solutions That{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Drive Results
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            From AI implementation to cybersecurity, we provide comprehensive IT services 
            tailored to your unique needs.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={cardVariants}
              className={`group relative p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 transition-all duration-500 hover:-translate-y-2 ${
                index === 4 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Icon with gradient */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.gradient} text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                {service.title}
              </h3>
              <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {service.features.map((feature) => (
                  <li
                    key={feature.text}
                    className="flex items-center gap-2 text-sm sm:text-base text-gray-300"
                  >
                    <span className="text-blue-400">{feature.icon}</span>
                    {feature.text}
                  </li>
                ))}
              </ul>

              {/* Hover Effect Line */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${service.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12 sm:mt-16"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm sm:text-base"
          >
            Need a custom solution?
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}