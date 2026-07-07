"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Globe, 
  HelpCircle, 
  CheckCircle, 
  BookOpen, 
  AlertTriangle,
  Loader2,
  Sparkles,
  ChevronRight,
  Flame
} from "lucide-react";
import { queryNagrikMitra, ReasoningResult } from "./actions/chat";
import ReasoningStepper from "../components/ReasoningStepper";
import PromptPanel from "../components/PromptPanel";

const SUGGESTED_QUERIES = [
  { text: "How to correct address in Aadhaar card?", label: "Aadhaar", lang: "en" },
  { text: "राशन कार्ड के लिए आवेदन कैसे करें?", label: "Ration Card", lang: "hi" },
  { text: "How to link PAN card with Aadhaar?", label: "PAN Link", lang: "en" },
  { text: "RTI कैसे फाइल करते हैं?", label: "RTI", lang: "hi" },
  { text: "Report a pothole in my area", label: "Road Issue", lang: "en" }
];

const LOADING_STEPS = [
  "Analyzing citizen query language & intent...",
  "Searching grounded Digital India service index...",
  "Structuring plain-language bureaucratic rules...",
  "Compiling step-by-step action checklist...",
  "Formatting glass-box reasoning audit trail..."
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [langPreference, setLangPreference] = useState<"en" | "hi">("en");
  const [result, setResult] = useState<ReasoningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  // Interval for loading micro-copy
  const startLoadingAnimation = () => {
    setLoadingStepIdx(0);
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => {
        if (prev >= LOADING_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setResult(null);

    const cleanup = startLoadingAnimation();

    startTransition(async () => {
      try {
        const response = await queryNagrikMitra(query, langPreference);
        setResult(response);
      } catch (err: any) {
        console.error(err);
        setError("Unable to process your request at this moment. Please try again.");
      } finally {
        cleanup();
      }
    });
  };

  const selectSuggested = (text: string, lang: string) => {
    setQuery(text);
    setLangPreference(lang as "en" | "hi");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex flex-col">
      {/* Header Banner representing India national colors elegantly */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      {/* Main Navigation */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-orange-500 via-orange-400 to-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm border border-orange-300">
              NM
            </div>
            <div>
              <span className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5 tracking-tight">
                Nagrik Mitra <span className="text-xs bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded font-bold border border-orange-200/50">Smart Bharat</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selection Toggle */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-700">
              <button
                onClick={() => setLangPreference("en")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  langPreference === "en"
                    ? "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                <Globe className="h-3 w-3" />
                English
              </button>
              <button
                onClick={() => setLangPreference("hi")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  langPreference === "hi"
                    ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Companion Search & Reasoning Output */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Bold Hero Section */}
          <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white rounded-3xl p-8 shadow-md border border-slate-800 relative overflow-hidden">
            {/* Elegant design elements */}
            <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12">
              <Sparkles className="h-80 w-80 text-orange-400" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <span className="bg-orange-500 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-white shadow-sm border border-orange-400 mb-4 inline-block">
                Smart Civic Companion
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Empowering Citizens with <br/>
                <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                  Glass-Box AI Guidance
                </span>
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                {langPreference === "en" 
                  ? "Enter any civic query. Unlike black-box chatbots, Nagrik Mitra opens up its reasoning system, mapping rules, services, and clear action steps." 
                  : "कोई भी सरकारी सेवा या शिकायत दर्ज करने की प्रक्रिया पूछें। सामान्य चैटबॉट्स के विपरीत, नागरिक मित्र आपको अपनी पूरी निर्णय प्रक्रिया दिखाता है।"}
              </p>
            </div>

            {/* Form Input Container */}
            <form onSubmit={handleSearch} className="mt-8 relative z-10">
              <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-2 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search className="h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      langPreference === "en"
                        ? "Ask about Aadhaar correction, Ration card eligibility, link PAN..."
                        : "पूछें: आधार कार्ड कैसे सुधारें? राशन कार्ड कैसे बनाएं?..."
                    }
                    className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending || !query.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 border border-orange-400"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {langPreference === "en" ? "Reasoning..." : "सोच रहा है..."}
                    </>
                  ) : (
                    <>
                      {langPreference === "en" ? "Consult Companion" : "सलाह लें"}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Suggested Queries */}
            <div className="mt-5 flex flex-wrap gap-2 items-center text-xs relative z-10">
              <span className="text-slate-400 font-semibold">{langPreference === "en" ? "Try asking:" : "जैसे पूछें:"}</span>
              {SUGGESTED_QUERIES.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSuggested(sq.text, sq.lang)}
                  className="bg-white/5 hover:bg-white/15 border border-white/5 text-slate-200 px-3 py-1 rounded-md transition-all text-[11px]"
                >
                  {sq.label}
                </button>
              ))}
            </div>
          </section>

          {/* Reasoning & Results Presentation */}
          <div className="flex-1 flex flex-col justify-start">
            <AnimatePresence mode="wait">
              {isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm"
                >
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-950 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-orange-500 h-5 w-5 rounded-full flex items-center justify-center border border-white">
                      <Flame className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <h4 className="font-extrabold text-zinc-950 dark:text-white text-base">
                    Nagrik Mitra is reasoning...
                  </h4>
                  
                  <div className="h-7 mt-2 overflow-hidden flex items-center justify-center">
                    <motion.p
                      key={loadingStepIdx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide"
                    >
                      {LOADING_STEPS[loadingStepIdx]}
                    </motion.p>
                  </div>
                  
                  <div className="w-48 bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-5 overflow-hidden">
                    <motion.div 
                      className="bg-indigo-600 h-full rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(loadingStepIdx + 1) * 20}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </motion.div>
              )}

              {result && !isPending && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6"
                >
                  <ReasoningStepper result={result} />
                </motion.div>
              )}

              {error && !isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800 flex items-start gap-3"
                >
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <h5 className="font-bold text-sm">System Interruption</h5>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                  </div>
                </motion.div>
              )}

              {!result && !isPending && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-16 text-center text-zinc-400 dark:text-zinc-600 flex flex-col items-center justify-center gap-3 bg-zinc-50/50"
                >
                  <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center mb-2">
                    <BookOpen className="h-6 w-6 text-zinc-400" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">No active consultation</h4>
                  <p className="text-xs max-w-sm leading-relaxed text-zinc-500 dark:text-zinc-500">
                    Submit your query or select a suggested topic to witness the Glass-Box reasoning trail.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Transparency Prompt Panel */}
        <div className="w-full lg:w-80 shrink-0">
          <PromptPanel />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 mt-10 bg-white dark:bg-zinc-950 text-center text-xs text-zinc-400 dark:text-zinc-600">
        <p>© 2026 Nagrik Mitra. Built for PromptWars Hackathon. Grounded, Transparent, and Accessible.</p>
      </footer>
    </div>
  );
}
