"use client";

import FileUpload from "./FileUpload";
import Image from "next/image";
import Link from "next/link";
import DLALogo from "./components/DLALogo";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentYear, setCurrentYear] = useState(2024); // Default to a fixed year initially
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Update the year on the client side after hydration
    setCurrentYear(new Date().getFullYear());
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#112e51] text-white py-4 sticky top-0 z-50 shadow-md transition-all duration-300">
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4 group">
            <DLALogo className="h-10 w-auto transform transition-transform duration-300 group-hover:scale-110" />
            <div className="font-bold text-xl md:text-2xl relative overflow-hidden">
              <span className="inline-block transition-transform duration-300 group-hover:translate-y-[-2px]">
                Defense Logistics Agency
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-300 transition-all duration-300 group-hover:w-full"></span>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="#" className="relative py-2 px-1 font-medium hover:text-blue-200 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-300 after:transition-all after:duration-300 hover:after:w-full">
              Home
            </Link>
            <Link href="#" className="relative py-2 px-1 font-medium hover:text-blue-200 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-300 after:transition-all after:duration-300 hover:after:w-full">
              About
            </Link>
            <Link href="#" className="relative py-2 px-1 font-medium hover:text-blue-200 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-300 after:transition-all after:duration-300 hover:after:w-full">
              Services
            </Link>
            <Link href="#" className="relative py-2 px-1 font-medium hover:text-blue-200 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-300 after:transition-all after:duration-300 hover:after:w-full">
              Contact
            </Link>
          </nav>
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden relative group p-2 rounded-md hover:bg-[#1a4577] transition-colors duration-300"
            aria-label="Toggle mobile menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-60 opacity-100 py-4 border-t border-blue-800' : 'max-h-0 opacity-0'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-3">
              <Link 
                href="#" 
                className="py-2 px-4 hover:bg-[#1a4577] rounded-md transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="#" 
                className="py-2 px-4 hover:bg-[#1a4577] rounded-md transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="#" 
                className="py-2 px-4 hover:bg-[#1a4577] rounded-md transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="#" 
                className="py-2 px-4 hover:bg-[#1a4577] rounded-md transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative py-20 md:py-32 lg:py-36 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.pexels.com/photos/10843104/pexels-photo-10843104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Military logistics" 
            fill 
            priority
            className="object-cover"
            style={{ filter: 'brightness(0.5)' }}
          />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-6 md:px-10 lg:px-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-lg pl-0 md:pl-4 lg:pl-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
                Defense Logistics Agency
              </h1>
              <p className="text-lg md:text-xl mb-6 text-blue-100 font-medium">
                Supporting America's Warfighters
              </p>
              <p className="mb-8 text-base text-blue-100 leading-relaxed opacity-90">
                The Defense Logistics Agency is the Department of Defense's combat logistics support agency. DLA provides the Army, Marine Corps, Navy, Air Force, Space Force and other federal agencies with a full spectrum of logistics, acquisition and technical services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#upload-section" className="bg-white text-blue-900 hover:bg-blue-100 transition px-6 py-3 rounded-md font-medium text-center shadow-md text-sm md:text-base">
                  Upload Documents
                </a>
                <a href="#" className="border border-white text-white hover:bg-white hover:text-blue-900 transition px-6 py-3 rounded-md font-medium text-center text-sm md:text-base">
                  Learn More
                </a>
              </div>
            </div>
           
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-full h-48 mb-6 relative rounded-md overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Supply Chain Management" 
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Supply Chain Management</h3>
              <p className="text-gray-600">DLA manages the global supply chain for the Army, Marine Corps, Navy, Air Force, Space Force and other federal agencies.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-full h-48 mb-6 relative rounded-md overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Procurement Services" 
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Procurement Services</h3>
              <p className="text-gray-600">DLA procures critical items including food, fuel, medical supplies, and equipment parts for military and government agencies.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-full h-48 mb-6 relative rounded-md overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2065&q=80" 
                  alt="Distribution Services" 
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Distribution Services</h3>
              <p className="text-gray-600">DLA provides worldwide distribution services through a network of distribution centers strategically located around the globe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="relative py-16 text-white">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Military personnel" 
            fill
            className="object-cover"
            style={{ filter: 'brightness(0.4)' }}
          />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Supporting Our Nation's Defense</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            DLA is committed to providing excellent logistics support to America's armed forces and other government agencies.
          </p>
          <a href="#" className="inline-flex items-center px-6 py-3 bg-white text-blue-900 rounded-md font-medium hover:bg-blue-100 transition">
            Learn About Our Mission
          </a>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">Document Upload</h2>
            <p className="text-center text-gray-600 mb-8">Upload your PDF documents for processing. Our system will analyze and extract relevant information.</p>
            <div className="bg-gray-50 p-6 md:p-8 rounded-lg shadow-md">
              <FileUpload />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#112e51] text-white py-12 mt-auto">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <DLALogo className="h-8 w-auto" />
                <h3 className="font-bold text-lg">Defense Logistics Agency</h3>
              </div>
              <p className="text-blue-200 mb-4">Supporting America's Warfighters</p>
              <p className="text-sm text-blue-200">8725 John J. Kingman Road<br />Fort Belvoir, VA 22060-6221</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-blue-200 hover:text-white transition">Home</Link></li>
                <li><Link href="#" className="text-blue-200 hover:text-white transition">About Us</Link></li>
                <li><Link href="#" className="text-blue-200 hover:text-white transition">Services</Link></li>
                <li><Link href="#" className="text-blue-200 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-blue-200 hover:text-white transition">Forms & Documents</Link></li>
                <li><Link href="#" className="text-blue-200 hover:text-white transition">Policies</Link></li>
                <li><Link href="#" className="text-blue-200 hover:text-white transition">Careers</Link></li>
                <li><Link href="#" className="text-blue-200 hover:text-white transition">News & Media</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-blue-200 hover:text-white transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-200 hover:text-white transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-200 hover:text-white transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-200 hover:text-white transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                  </svg>
                </a>
              </div>
              <p className="text-sm text-blue-200">Sign up for our newsletter to receive updates and information.</p>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-sm text-blue-200 text-center">
            <p>&copy; {currentYear} Defense Logistics Agency. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
