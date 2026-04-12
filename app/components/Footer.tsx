'use client';
import Image from 'next/image';
import Link from 'next/link';
import { BsFillPeopleFill } from 'react-icons/bs';
import { FaServer, FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { GiFaceToFace } from 'react-icons/gi';

export default function Footer() {
  return (
    <footer className="bg-[#FD9EE0] text-[#1C1009] mt-10 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top: Logo + Links */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 pt-8">
          <div className="flex flex-col gap-3 max-w-md shrink-0">
            <Link
              href="/"
              className="relative block h-24 w-[min(100%,380px)] sm:h-28 sm:w-[min(100%,420px)]"
            >
              <Image
                src="/Ozyraa.jpg"
                alt="Book Haven"
                fill
                className="object-contain object-left"
                sizes="(max-width: 640px) 100vw, 420px"
              />
            </Link>
            <p className="text-sm leading-relaxed opacity-90">
              Design amazing digital experiences that create more happiness in the world. Build,
              innovate, and inspire with Locally UI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 flex-1 min-w-0">
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <BsFillPeopleFill /> About Us
              </h3>
              <ul className="space-y-1 text-sm">
                {['Our Story', 'Team', 'Careers', 'Blog'].map((text) => (
                  <li key={text}>
                    <Link href="/#" className="hover:underline hover:opacity-80">
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <FaServer /> Services
              </h3>
              <ul className="space-y-1 text-sm">
                {['Web Design', 'Development', 'Branding', 'Consulting'].map((text) => (
                  <li key={text}>
                    <Link href="/#" className="hover:underline hover:opacity-80">
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <GiFaceToFace /> Support
              </h3>
              <ul className="space-y-1 text-sm">
                {['Help Center', 'FAQs', 'Contact Us', 'Feedback'].map((text) => (
                  <li key={text}>
                    <Link href="/#" className="hover:underline hover:opacity-80">
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          {[FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaTiktok].map((Icon, idx) => (
            <Link key={idx} href="/#" className="text-[#1C1009] hover:opacity-70 transition-opacity">
              <Icon className="text-lg" />
            </Link>
          ))}
        </div>

        <hr className="my-6 border-[#1C1009]/25" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-6 text-sm text-center md:text-left">
          <p>© 2025 Ozyra UI. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:justify-end">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((text) => (
              <Link key={text} href="/#" className="hover:underline hover:opacity-80">
                {text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
