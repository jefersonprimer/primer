import React from 'react';

export default function ProductBenefits() {
  const benefits = [
    {
      icon: "🛡️",
      title: "Unbeatable Confidence",
      description: "Never be without an answer, speak with total confidence.",
      detail: "Powered by RAG technology that instantly retrieves relevant context from your documents during conversations."
    },
    {
      icon: "⚡",
      title: "Maximum Productivity",
      description: "Save hours by automating follow-ups and responses.",
      detail: "Deep bi-directional integration with Notion and Google Calendar means your admin work happens automatically."
    },
    {
      icon: "🏆",
      title: "Competitive Advantage",
      description: "Outperform competitors with flawless, AI-powered presentations.",
      detail: "Edit notes, tweak schedules, and manage tasks without ever leaving the application interface."
    },
    {
      icon: "📈",
      title: "Continuous Improvement",
      description: "Analyze your performance and improve with each presentation.",
      detail: "Your agent tracks outcomes and helps you refine your approach over time."
    }
  ];

  return (
    <section className="w-full max-w-6xl mt-16 flex flex-col gap-12 mb-32">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white">
          Sell more, with less effort and more impact
        </h2>
        <p className="text-zinc-600 dark:text-white/60 text-lg max-w-2xl mx-auto">
          Combined with advanced RAG, Notion, and Calendar integrations, you have a complete command center.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex flex-col gap-4 p-8 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{benefit.icon}</div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-white">{benefit.title}</h3>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-900 dark:text-white font-medium text-lg">
                {benefit.description}
              </p>
              <p className="text-zinc-600 dark:text-white/60 text-base leading-relaxed">
                {benefit.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
