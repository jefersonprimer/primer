import React from 'react';

export default function TargetAudience() {
  const audiences = [
    {
      icon: "💼",
      title: "Sales Professionals",
      description: "Close more deals by responding to objections with data and confidence."
    },
    {
      icon: "🚀",
      title: "Entrepreneurs",
      description: "Present your vision convincingly and win over investors and customers."
    },
    {
      icon: "👔",
      title: "Executives & Directors",
      description: "Conduct strategic meetings with instant data at your fingertips."
    },
    {
      icon: "🎤",
      title: "Interviewers",
      description: "Formulate impactful questions and react to unexpected answers with real-time follow-up suggestions."
    },
    {
      icon: "🎭",
      title: "Any Presenter",
      description: "From interviews to conferences, elevate your performance."
    }
  ];

  return (
    <section className="w-full max-w-6xl mt-16 flex flex-col gap-12">
      <h2 className="text-3xl font-semibold text-center text-zinc-900 dark:text-white">
        Who is this app for?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {audiences.map((audience, index) => (
          <div key={index} className="flex flex-col gap-4 p-8 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
            <div className="text-4xl">{audience.icon}</div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-medium text-zinc-900 dark:text-white">{audience.title}</h3>
              <p className="text-zinc-600 dark:text-white/60 text-base leading-relaxed">
                {audience.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
