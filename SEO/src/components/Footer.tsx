"use client";

import { Brain, Mail } from "lucide-react";

const footerLinks = {
  services: [
    { label: "AI & Smart Systems", href: "#services" },
    { label: "Custom Development", href: "#services" },
    { label: "Servers & Networking", href: "#services" },
    { label: "Automation & DevOps", href: "#services" },
    { label: "Cybersecurity", href: "#services" },
  ],
  company: [
    { label: "About Us", href: "#why-us" },
    { label: "Solutions", href: "#audience" },
    { label: "Contact", href: "#contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-[#0f172a] border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                TechServices
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Modern IT and AI solutions made simple and accessible for individuals and businesses.
            </p>
            <a
              href="mailto:contact@techservices.com"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-sm"
            >
              <Mail size={16} />
              contact@techservices.com
            </a>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get Started</h4>
            <p className="text-gray-400 text-sm mb-4">
              Ready to transform your IT infrastructure? Let's talk.
            </p>
            <a
              href="#contact"
              className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-blue-500 hover:to-cyan-400 transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm text-center">
            &copy; 2024 TechServices. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}