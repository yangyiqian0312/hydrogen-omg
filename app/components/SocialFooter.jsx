import React from 'react';
import { Link } from '@remix-run/react';
import { Instagram, Twitter, Youtube } from 'lucide-react';

const SocialFooter = () => {
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SocialFooter;