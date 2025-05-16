// app/privacy/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function PrivacyPolicyPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-white px-6 py-12 md:px-20 lg:px-48">
      <div
        className={`transition-all duration-700 ease-in-out ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Link
          href="/"
          className="inline-flex items-center text-purple-600 font-semibold mb-8 hover:text-purple-800 transition"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-extrabold text-center text-purple-800 mb-6">
          Privacy Policy
        </h1>

        <p className="text-gray-700 text-lg mb-4 text-center">
          This Privacy Policy explains how we handle your information at{" "}
          <strong>Operation Save My CGPA</strong>. Your privacy is very important to us.
        </p>

        <section className="space-y-8 text-gray-700 text-md leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">1. Information We Collect</h2>
            <p>We may collect the following information from users:</p>
            <ul className="list-disc ml-6">
              <li>Full name</li>
              <li>Email address</li>
              <li>Course or subject preferences</li>
              <li>Login credentials (securely hashed)</li>
              <li>Device/browser metadata</li>
              <li>Exam performance and progress</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">2. How We Use Your Information</h2>
            <p>We use your data to:</p>
            <ul className="list-disc ml-6">
              <li>Provide personalized academic testing and tracking</li>
              <li>Improve the quality of our platform</li>
              <li>Monitor usage for performance and analytics</li>
              <li>Enhance security and prevent fraud</li>
              <li>Send occasional updates or reminders</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">3. Data Protection</h2>
            <p>
              All personal information is stored securely and protected using modern encryption and best practices.
              We do not share your personal data with third parties unless legally required.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">4. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6">
              <li>Access your data</li>
              <li>Request correction or deletion</li>
              <li>Opt-out of communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">5. Cookies & Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your user experience. For details, please see our{" "}
              <Link href="/cookies" className="text-green-600 underline hover:text-green-800">
                Cookies Policy
              </Link>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">6. Changes to This Policy</h2>
            <p>
              This Privacy Policy may be updated periodically. We encourage you to review it regularly to stay informed.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">7. Contact Us</h2>
            <p>
              If you have questions or concerns about this policy, contact our admin via WhatsApp:
              <br />
              <a
                href="https://wa.me/2348083191228"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline"
              >
                +2348083191228
              </a>
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
