"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { User, Building2, Check } from "lucide-react";

export default function TargetAudience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="audience"
      className="relative py-20 sm:py-32"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium rounded-full mb-4">
            Who We Serve
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Solutions for{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Everyone
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Whether you're an individual or a growing business, we have the expertise to elevate your IT infrastructure.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Individuals */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="group relative p-6 sm:p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500/20 text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <User size={28} />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
              For Individuals
            </h3>
            <p className="text-gray-400 mb-6 sm:mb-8 leading-relaxed">
              Personalized technology solutions that empower you to achieve more 
              while maintaining complete control over your data.
            </p>

            <ul className="space-y-4">
              {[
                "Personal AI assistants & productivity tools",
                "Custom software for unique needs",
                "Secure home network setup & monitoring",
                "Device optimization & troubleshooting",
                "Data backup & recovery solutions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Check size={18} className="text-green-400" />
                  </div>
                  <span className="text-gray-300 text-sm sm:text-base">{item}</span>
                </li>
              ))}
            </ul>

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 bg-blue-500/20 transition-opacity duration-500" />
          </motion.div>

          {/* SMBs */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="group relative p-6 sm:p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-500/20 text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Building2 size={28} />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
              For SMBs
            </h3>
            <p className="text-gray-400 mb-6 sm:mb-8 leading-relaxed">
              Enterprise-grade solutions designed for growing businesses, 
              helping you compete with larger organizations.
            </p>

            <ul className="space-y-4">
              {
                [
                  "Business automation & workflow optimization",
                  "Complete digital transformation services",
                  "Data security without cloud dependency",
                  "Server & network infrastructure management",
                  "IT strategy & consulting",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Check size={18} className="text-green-400" />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base">{item}</span>
                  </li>
                ))}
            </ul>

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 bg-cyan-500/20 transition-opacity duration-500" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}