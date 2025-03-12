"use client";

import React from 'react';

interface DLALogoProps {
  className?: string;
}

const DLALogo: React.FC<DLALogoProps> = ({ className = "h-10 w-auto" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="60" rx="4" fill="#112E51" />
      <path d="M10 15H50V20H10V15Z" fill="white" />
      <path d="M10 25H50V30H10V25Z" fill="white" />
      <path d="M10 35H50V40H10V35Z" fill="white" />
      <path d="M10 45H30V50H10V45Z" fill="white" />
      <path d="M70 15H85C93.2843 15 100 21.7157 100 30C100 38.2843 93.2843 45 85 45H70V15Z" fill="#112E51" />
      <path d="M70 20H85C90.5228 20 95 24.4772 95 30C95 35.5228 90.5228 40 85 40H70V20Z" fill="white" />
      <path d="M70 25H85C87.7614 25 90 27.2386 90 30C90 32.7614 87.7614 35 85 35H70V25Z" fill="#112E51" />
      <path d="M110 15H120V45H110V15Z" fill="#112E51" />
      <path d="M130 15H155L170 45H155L152 38H133L130 45H115L130 15Z" fill="#112E51" />
      <path d="M138 30H147L143 20L138 30Z" fill="white" />
      <path d="M180 15H190V45H180V15Z" fill="#112E51" />
    </svg>
  );
};

export default DLALogo; 