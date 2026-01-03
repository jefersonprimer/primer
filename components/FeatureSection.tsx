import React from 'react';

export default function FeatureSection() {
  const features = [
    {
      icon: "🗂️",
      title: "Task, notes & calendar automation",
      subtitle: "Turn conversations into action instantly.",
      items: [
        "Create tasks from chats",
        "Schedule events directly in Google Calendar",
        "Write and organize notes in Notion",
        "Save decisions automatically, without manual input"
      ]
    },
    {
      icon: "🧠",
      title: "Contextual memory (Learns from you)",
      subtitle: "Your agent gets smarter the more you use it.",
      items: [
        "Learns from your chats and past decisions",
        "Recalls context when creating tasks or events",
        "Uses your history to act consistently with how you work"
      ]
    },
    {
      icon: "🎙️",
      title: "Real-Time Voice Interaction",
      subtitle: "Talk naturally. The agent handles the rest.",
      items: [
        "Speak to create notes, tasks, or events",
        "Works in real time while you talk",
        "No commands, no rigid structure — just conversation"
      ]
    }
  ];

  return (
    <section className="w-full max-w-6xl mt-16 flex flex-col gap-12">
      <h2 className="text-3xl font-semibold text-center text-zinc-900 dark:text-white">
        Situations where your AI agent helps
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
            <div className="text-4xl">{feature.icon}</div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-medium text-zinc-900 dark:text-white">{feature.title}</h3>
              <p className="text-zinc-600 dark:text-white/60 text-sm">{feature.subtitle}</p>
            </div>
            <ul className="flex flex-col gap-2 mt-2">
              {feature.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-white/80">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-400 dark:bg-white/40 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
