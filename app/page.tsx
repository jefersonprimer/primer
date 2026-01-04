import Image from "next/image";
import DownloadButtons from "@/components/DownloadButtons";
import FeatureSection from "@/components/FeatureSection";
import TargetAudience from "@/components/TargetAudience";
import ProductBenefits from "@/components/ProductBenefits";
import FAQ from "@/components/FAQ";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center py-32 px-16 bg-white dark:bg-black gap-12">
        <div className="flex flex-col w-full max-w-3xl items-center justify-center text-center gap-4">
          <h1 className="text-white text-6xl ">Autonomous <br/> Desktop Agent</h1>
          <p className="text-white/80 text-base">Notes, events, and long-term memory powered by your conversations, with deep integrations into Google Calendar and Notion.</p>
          <DownloadButtons />
        </div>  
        <div className="w-full max-w-5xl mt-8 flex flex-col gap-4 py-4 rounded-2xl border border-[#111111] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white text-base">
          <div className="flex items-center justify-between px-6">
            <h3>Ai tips</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              width="20" 
              height="20" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </div>

          <div className="w-full border-b border-[#111111]"/>           
          <div className="flex flex-col gap-4 px-6">
            <p>
              Your AI agent helps you turn conversations into action. <br/>
              Ask it to schedule events, create notes, or remember key decisions it learns from your chats to support you better over time.
            </p>
            <p className="font-semibold text-zinc-900 dark:text-white">
              What do you usually struggle to keep track of during your day?
            </p>
          </div>
        </div>
        <FeatureSection />
        <TargetAudience />
        <ProductBenefits />
        <FAQ />
        <CTASection />
      </main>
    </div>
  );
}
