'use client';

import React, { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Why real-time vs. a regular AI notetaker?",
      answer: "Unlike traditional notetakers that process recordings after the meeting, our app provides real-time assistance, helping you during the conversation when you need it most."
    },
    {
      question: "Is the download free?",
      answer: "Yes, the application is free to download and includes a trial period for you to explore all premium features."
    },
    {
      question: "What languages does the app use?",
      answer: "The application supports English, Spanish, Portuguese, French, and German for both voice recognition and interface text."
    },
    {
      question: "Is it undetectable?",
      answer: "The app runs as a standalone desktop application. It does not inject code into your browser or meeting software (like Zoom or Teams), making it discreet and non-intrusive."
    },
    {
      question: "Do you offer support?",
      answer: "Yes! If you have any issues, please send an email to help@perssua.com and we will get back to you as soon as possible."
    },
    {
      question: "Does the app work with Zoom?",
      answer: "Yes, it works with Zoom, Google Meet, Microsoft Teams, and any other audio source on your computer since it listens to system audio."
    },
    {
      question: "Does the app store my conversations?",
      answer: "Your privacy is our priority. Recordings and transcripts are stored locally on your device by default. If you use cloud features, data is encrypted and never shared with third parties."
    },
    {
      question: "Does the app have access to my API keys?",
      answer: "If you choose to bring your own API keys (e.g., for OpenAI), they are stored securely in your local keychain and are never sent to our servers."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq relative z-1 w-full py-12 md:py-16 lg:py-24 pt-[105px] pb-6 md:pt-[152px] md:pb-2.5 lg:pt-[198px] lg:pb-[122px] xl:pt-[218px] xl:pb-[85px]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-y-5 px-5 md:px-8">
        <h2 className="text-28 leading-tight font-medium tracking-4 text-foreground md:text-4xl md:text-32 lg:mb-[16px] lg:text-40 xl:mb-[24px]">
          Frequently asked questions
        </h2>
        <div className="text-foreground">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b last:border-b-0">
              <h3 className="flex">
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="flex flex-1 items-center justify-between rounded py-4 text-sm font-medium transition-all gap-x-4 text-left tracking-tight text-foreground hover:text-foreground/80 hover:no-underline sm:py-4 md:py-[19px] lg:py-5 [&_svg]:size-7"
                >
                  <span className="text-18 leading-snug font-medium tracking-4 text-pretty md:text-xl md:text-20 md:leading-[1.125] lg:text-24">
                    {faq.question}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`lucide lucide-chevron-down size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </button>
              </h3>
              <div
                className={`overflow-hidden text-sm transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pb-4 pt-0 text-base text-muted-foreground md:text-lg lg:text-xl">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}