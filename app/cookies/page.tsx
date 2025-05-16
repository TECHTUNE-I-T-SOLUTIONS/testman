// app/cookies/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

export default function CookiesPolicyPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 md:px-20 lg:px-48">
      <div
        className={`transition-all duration-700 ease-in-out ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Link
          href="/"
          className="inline-flex items-center text-purple-700 font-semibold mb-8 hover:text-purple-900 transition"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-center text-purple-800 mb-6">
          Cookies Policy
        </h1>

        <p className="text-gray-700 text-lg mb-4">
          This Cookies Policy explains how <strong>Operation Save My CGPA</strong> uses cookies and similar technologies to recognize you when you visit our website.
        </p>

        <section className="space-y-6 text-gray-700 text-md leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">1. What Are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. They help us enhance your experience by remembering your preferences and activity.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">2. How We Use Cookies</h2>
            <p>We use cookies to:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Keep you signed in</li>
              <li>Understand how you use our platform</li>
              <li>Improve platform performance and features</li>
              <li>Secure your session data</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">3. Types of Cookies We Use</h2>
            <ul className="list-disc list-inside ml-4">
              <li><strong>Essential Cookies:</strong> Required for site functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand user behavior</li>
              <li><strong>Functional Cookies:</strong> Remember user preferences</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">4. Managing Cookies</h2>
            <p>
              You can choose to disable cookies through your browser settings. However, this may impact the usability and functionality of the website.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">5. Changes to This Policy</h2>
            <p>
              We may update this Cookies Policy from time to time. We encourage users to review it periodically for any changes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">6. Contact</h2>
            <p>
              For questions about this policy, contact the admin via WhatsApp at{" "}
              <a
                href="https://wa.me/2348083191228"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline"
              >
                +2348083191228
              </a>.
            </p>
          </div>
        </section>

        <p className="text-center text-sm text-gray-500 mt-10">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
