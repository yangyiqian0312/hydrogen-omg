import React from 'react';
import { Link } from '@remix-run/react';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
const SocialFooter = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const links = [
    {
      title: 'Privacy Policy',
      to: 'policies/privacy-policy'
    },
    {
      title: 'Return & Refund',
      to: 'policies/refund-policy'
    },
    // {
    //   title: 'Shipping Policy',
    //   to: 'policies/shipping-policy'
    // },
    {
      title: 'Terms of Service',
      to: 'policies/terms-of-service'
    }
  ];

  return (
    <footer className="bg-white">
      <div className="border-t my-4 mx-2 border-gray-300"></div>
      <nav className="py-2 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6">
            {links.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="group relative px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                    {link.title}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gray-200 group-hover:w-full transition-all duration-200"></div>
              </Link>
            ))}
            <div
              className="group relative px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/contactus');
              }}
            >
              <div className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 group-hover:underline transition-colors duration-200">
                  Contact Us
                </span>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gray-200 group-hover:w-full transition-all duration-200"></div>
            </div>
            {/* Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-200/75 z-50">
                <div className="bg-white rounded-xl p-8 lg:p-16 text-center max-w-sm mx-auto shadow-lg">
                  <h2 className="text-2xl lg:text-3xl font-semibold mb-4 lg:mb-8">Contact Us</h2>
                  <div className="flex justify-center mb-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 0a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm lg:text-xl lg:mb-4 ">Email: <a href="mailto:omgbeautyservice@yahoo.com" className="text-blue-600 lg:text-xl underline">omgbeautyservice@yahoo.com</a></p>
                  <p className="text-gray-500 text-sm lg:text-xl mt-1 lg:my-8">Replies Within 24 Hours</p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="border-t my-4 mx-2 border-gray-300"></div>

      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex justify-center mb-8 lg:mb-0 order-2 lg:order-1">
            <span className="text-sm text-gray-500">© 2025 OMG BEAUTY, Inc. All rights reserved.</span>
          </div>

          <div className="flex justify-center mb-8 lg:mb-0 order-1 lg:order-2">
            <div className="flex gap-8">
              <a href="https://www.instagram.com/omgbeautybox?igsh=NTc4MTIwNjQ2YQ==" className="text-gray-400 hover:text-gray-900 transition-colors duration-200 transform hover:scale-110" aria-label="Instagram">
                <Instagram size={24} strokeWidth={1.5} />
              </a>
              <a href="https://www.tiktok.com/@omgbeautyshop" className="text-gray-400 hover:text-gray-900 transition-colors duration-200 transform hover:scale-110" aria-label="TikTok">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
              <a href="mailto:omgbeautyservice@yahoo.com" className="text-gray-400 hover:text-gray-900 transition-colors duration-200 transform hover:scale-110" aria-label="Mail">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-900"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 0a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SocialFooter;