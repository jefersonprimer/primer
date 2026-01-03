"use client";

import { useEffect, useState } from "react";

type OS = "windows" | "mac" | "linux" | null;

export default function DownloadButtons() {
  const [os, setOs] = useState<OS>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes("Win")) {
      setOs("windows");
    } else if (userAgent.includes("Mac")) {
      setOs("mac");
    } else if (userAgent.includes("Linux")) {
      setOs("linux");
    } else {
      // Default fallback or detect mobile? 
      // For now, if unknown, we might want to show all or nothing. 
      // Let's default to windows or just stay null (and maybe show all options as fallback).
      // Given the requirement "detect qual so e do user", I'll default to showing all if unknown,
      // or maybe just Windows as a safe bet for "most users" if I have to pick one, 
      // but showing nothing or a "Download" generic button is better.
      // However, the prompt implies "detect -> show specific".
      // Let's assume if we can't detect, we show Windows as it has the biggest market share, or show nothing.
      // Let's set it to null and handle rendering logic to show all if null?
      // Re-reading: "se for windows so mostra uma... se for linux mostra as duas..."
      // It implies dynamic behavior. If I can't detect, I will show options for all platforms essentially acting as a download page section.
      setOs(null); 
    }
  }, []);

  const WindowsIcon = () => (
    <svg viewBox="0 0 88 88" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
       <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.253L.048 75.248l-.013-29.06zM40.645 6.9l46.726-6.326V42.02l-46.696.16zm.017 38.66l46.707.24V87.04l-46.69-6.44z"/>
    </svg>
  );

  const AppleIcon = () => (
    <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/>
    </svg>
  );

  const LinuxIcon = () => (
    <svg viewBox="0 0 448 512" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M433.754 420.445c-11.526 1.393-44.86-52.741-44.86-52.741 0 31.345-16.136 72.247-51.051 101.786 16.842 5.192 54.843 19.167 45.803 34.421-7.316 12.343-125.51 7.881-159.632 4.037-34.122 3.844-152.316 8.306-159.632-4.037-9.045-15.25 28.918-29.214 45.783-34.415-34.92-29.539-51.059-70.445-51.059-101.792 0 0-33.334 54.134-44.859 52.741-5.37-.65-12.424-29.644 9.347-99.704 10.261-33.024 21.995-60.478 40.144-105.779C60.683 98.063 108.98 0 224 0c113.748 0 162.068 95.554 162.068 214.964 18.152 45.301 29.883 72.756 40.144 105.779 21.767 70.06 14.713 99.053 9.346 99.702z"/>
    </svg>
  );

  const Button = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => (
    <a
      href={href}
      className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-full font-medium transition-transform hover:scale-105 active:scale-95"
    >
      <Icon />
      <span>{label}</span>
    </a>
  );

  // If OS is null (server-side or undetected), we can render nothing or placeholders.
  // To avoid hydration mismatch, we should only render after mount or handle consistent server/client rendering.
  // Since we rely on window.navigator, this must be client-side.
  // We'll return null if os is null to avoid flashing wrong buttons, or we could render a generic loading state.
  if (os === null) {
    // Show all options as fallback? Or nothing?
    // Let's show nothing initially to be clean, or check if we want a default.
    // Given the request is specific about detecting OS, let's render nothing until detected.
    // Actually, for better UX/SEO, maybe providing links to a download page is better?
    // But strictly following the "detect user OS" instruction:
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {os === "windows" && (
        <Button icon={WindowsIcon} label="Download for Windows" href="#" />
      )}
      
      {os === "mac" && (
        <>
          <Button icon={AppleIcon} label="macOS (Apple Silicon)" href="#" />
          <Button icon={AppleIcon} label="macOS (Intel)" href="#" />
        </>
      )}

      {os === "linux" && (
        <>
          <Button icon={LinuxIcon} label="Linux (AMD64)" href="#" />
          <Button icon={LinuxIcon} label="Linux (ARM64)" href="#" />
        </>
      )}
    </div>
  );
}
