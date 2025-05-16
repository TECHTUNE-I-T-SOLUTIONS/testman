// app/terms/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

export default function TermsPage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 md:px-20 lg:px-48">
      <div
        className={`transform transition-all duration-700 ease-in-out ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
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
          Terms of Service
        </h1>

        <p className="text-gray-700 text-lg mb-4">
          Welcome to <strong>Operation Save My CGPA</strong>. By accessing or using our platform, you agree to the following terms. Please read them carefully.
        </p>

        <section className="space-y-6 text-gray-700 text-md leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">1. User Responsibilities</h2>
            <p>
              Users are expected to use the platform responsibly and respectfully. Any misuse of the testing system or platform features may lead to suspension or permanent ban.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">2. Data Privacy</h2>
            <p>
              We collect and store necessary user data to enhance your learning experience. Your data will not be shared with third parties except as required by law.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">3. Intellectual Property</h2>
            <p>
              All content on this platform, including questions, designs, and course materials, is owned by Operation Save My CGPA or its licensors. Unauthorized use is prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">4. Limitations of Liability</h2>
            <p>
              We are not responsible for any loss or damage caused by your reliance on information from this platform. We provide no guarantees of academic performance improvement.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">5. Modifications</h2>
            <p>
              These terms may be updated from time to time. Users will be notified of any major changes, and continued use of the platform implies acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">6. Contact</h2>
            <p>
              For any concerns or questions, contact us via WhatsApp at{" "}
              <a
                href="https://wa.me/2348083191228"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline"
              >
                +2348083191228
              </a>
              .
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
