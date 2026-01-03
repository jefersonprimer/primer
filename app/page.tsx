import Image from "next/image";
import DownloadButtons from "@/components/DownloadButtons";
import FeatureSection from "@/components/FeatureSection";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-center py-32 px-16 bg-white dark:bg-black gap-12">
        <div className="flex flex-col w-full max-w-3xl items-center justify-center text-center gap-4">
          <h1 className="text-white text-6xl">Autonomous <br/> Desktop Agent</h1>
          <p className="text-white/80 text-base">Notes, events, and long-term memory powered by your conversations, with deep integrations into Google Calendar and Notion.</p>
          <DownloadButtons />
        </div>  
        <div className="w-full max-w-6xl mt-8 flex flex-col gap-6 p-8 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white/60 text-base text-center">
          <p>
            Your AI agent helps you turn conversations into action. <br/>
            Ask it to schedule events, create notes, or remember key decisions — it learns from your chats to support you better over time.
          </p>
          <p className="font-semibold text-zinc-900 dark:text-white">
            What do you usually struggle to keep track of during your day?
          </p>
        </div>
        <FeatureSection />
      </main>
    </div>
  );
}
