"use client";

import { useState } from "react";
import { SYSTEM_PROMPT } from "../app/config/systemPrompt";
import { Terminal, ShieldAlert, Cpu, Database, FileCode2 } from "lucide-react";

type Lang = "en" | "hi" | "hinglish";

const PANEL_TEXT: Record<string, Record<Lang, string>> = {
  title: { en: "How Nagrik Mitra Thinks", hi: "नागरिक मित्र कैसे सोचता है", hinglish: "Nagrik Mitra Kaise Sochta Hai" },
  subtitle: {
    en: "Explore the exact system instructions and grounding principles that govern the AI companion.",
    hi: "एआई साथी को नियंत्रित करने वाले सटीक सिस्टम निर्देश और सिद्धांत देखें।",
    hinglish: "AI companion ko control karne wale exact system instructions aur principles dekhein."
  },
  architectureTab: { en: "Prompt Architecture", hi: "प्रॉम्प्ट संरचना", hinglish: "Prompt Architecture" },
  rawTab: { en: "View System Prompt", hi: "सिस्टम प्रॉम्प्ट देखें", hinglish: "System Prompt Dekhein" },
};

export default function PromptPanel({ lang = "en" }: { lang?: Lang }) {
  const [activeTab, setActiveTab] = useState<"structure" | "raw">("structure");

  const promptSections = [
    {
      title: "1. Persona & Tone Guidelines",
      icon: <Cpu className="h-4 w-4 text-orange-500" />,
      desc: "Establishes 'Nagrik Mitra' as an empathetic, neutral, and highly knowledgeable Indian civic companion, instructing it to match the citizen's language (Hindi or English)."
    },
    {
      title: "2. Grounded Reference Data",
      icon: <Database className="h-4 w-4 text-blue-500" />,
      desc: "Embeds 8-12 highly specific real Indian government services (e.g. Aadhaar Correction rules, Ration Card criteria, RTI filings, and Pothole reporting portals)."
    },
    {
      title: "3. Structured Output Constraint",
      icon: <FileCode2 className="h-4 w-4 text-emerald-500" />,
      desc: "Strictly commands the LLM to output a raw JSON structure containing: language, query understanding, service match, plain explanation, action steps, and disclaimer."
    },
    {
      title: "4. Accuracy Caveat & Disclaimer",
      icon: <ShieldAlert className="h-4 w-4 text-red-500" />,
      desc: "Enforces that the AI must include a prominent warning redirecting citizens to verify information at official government portals before taking offline actions."
    }
  ];

  return (
    <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-indigo-600" />
          <span>{PANEL_TEXT.title[lang]}</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {PANEL_TEXT.subtitle[lang]}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 px-4 pt-2">
        <button
          onClick={() => setActiveTab("structure")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "structure"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          {PANEL_TEXT.architectureTab[lang]}
        </button>
        <button
          onClick={() => setActiveTab("raw")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "raw"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          {PANEL_TEXT.rawTab[lang]}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-5 max-h-[460px] overflow-y-auto">
        {activeTab === "structure" ? (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              To maximize <strong>accuracy and civic utility</strong>, our system prompt utilizes a structured engineering design rather than raw conversational prompts.
            </p>
            <div className="space-y-3">
              {promptSections.map((section, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {section.icon}
                    <h4 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">{section.title}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pl-6">{section.desc}</p>
                </div>
              ))}
            </div>
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Grounded Scenarios</span>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal mt-1">
New Aadhaar Enrollment (incl. children) • Aadhaar Correction • Ration Card application • Birth Certificate registration • RTI Filing • Pothole Grievances • Municipal Water issues • Social Pensions • PAN-Aadhaar links • Caste Certificates • Income verification.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <pre className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200/65 dark:border-zinc-800/80 overflow-x-auto whitespace-pre-wrap select-all">
              {SYSTEM_PROMPT}
            </pre>
            <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-sm">
              Read-Only
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
