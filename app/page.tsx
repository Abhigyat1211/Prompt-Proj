"use client";

import { useState, useTransition } from "react";
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
  Flame,
  MessageSquare,
  FileText,
  MapPin,
  ClipboardList,
  Activity,
  ArrowRight,
  Info
} from "lucide-react";
import { queryNagrikMitra, ReasoningResult } from "./actions/chat";
import { createComplaint, fetchComplaintById, ComplaintData, ExtractionResult } from "./actions/complaints";
import ReasoningStepper from "../components/ReasoningStepper";
import PromptPanel from "../components/PromptPanel";

const SUGGESTED_QUERIES = [
  { text: "How to correct address in Aadhaar card?", label: "Aadhaar", lang: "en" },
  { text: "राशन कार्ड के लिए आवेदन कैसे करें?", label: "Ration Card", lang: "hi" },
  { text: "How to link PAN card with Aadhaar?", label: "PAN Link", lang: "en" },
  { text: "RTI kaise file karein?", label: "RTI (Hinglish)", lang: "hinglish" },
  { text: "Road par gaddhe ki complaint kaise karein?", label: "Road (Hinglish)", lang: "hinglish" }
];

const LOADING_STEPS = [
  "Analyzing citizen query language & intent...",
  "Searching grounded Digital India service index...",
  "Structuring plain-language bureaucratic rules...",
  "Compiling step-by-step action checklist...",
  "Formatting glass-box reasoning audit trail..."
];

export default function Home() {
  // Navigation Tabs: companion, report, track
  const [activeTab, setActiveTab] = useState<"companion" | "report" | "track">("companion");
  const [langPreference, setLangPreference] = useState<"en" | "hi" | "hinglish">("en");

  // Tab 1: Companion states
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ReasoningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  // Tab 2: Report states
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintLoc, setComplaintLoc] = useState("");
  const [isReporting, startReportTransition] = useTransition();
  const [reportResult, setReportResult] = useState<{ data: ComplaintData; stepInfo: ExtractionResult } | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportStepIdx, setReportStepIdx] = useState(0);

  // Tab 3: Track states
  const [trackId, setTrackId] = useState("");
  const [isTrackPending, startTrackTransition] = useTransition();
  const [trackResult, setTrackResult] = useState<ComplaintData | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Interval for loading micro-copy
  const startLoadingAnimation = (stepsList: string[], setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(0);
    const interval = setInterval(() => {
      setter((prev) => {
        if (prev >= stepsList.length - 1) {
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

    const cleanup = startLoadingAnimation(LOADING_STEPS, setLoadingStepIdx);

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
    setLangPreference(lang as "en" | "hi" | "hinglish");
    setActiveTab("companion");
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDesc.trim()) return;

    setReportError(null);
    setReportResult(null);

    const reportingSteps = [
      "Parsing complaint text structure...",
      "AI extracting category classification...",
      "AI identifying location landmark...",
      "AI calculating priority & urgency...",
      "Registering in Supabase database..."
    ];
    const cleanup = startLoadingAnimation(reportingSteps, setReportStepIdx);

    startReportTransition(async () => {
      try {
        const response = await createComplaint(complaintDesc, complaintLoc);
        if (response.success && response.data) {
          setReportResult({ data: response.data, stepInfo: response.stepInfo });
          setComplaintDesc("");
          setComplaintLoc("");
        } else {
          setReportError(response.error || "Complaint submission failed.");
        }
      } catch (err: any) {
        console.error(err);
        setReportError("Database connectivity issue. Storing failed.");
      } finally {
        cleanup();
      }
    });
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;

    setTrackError(null);
    setTrackResult(null);

    startTrackTransition(async () => {
      try {
        const response = await fetchComplaintById(trackId);
        if (response.success && response.data) {
          setTrackResult(response.data);
        } else {
          setTrackError(response.error || "No complaint matched this tracking ID.");
        }
      } catch (err: any) {
        console.error(err);
        setTrackError("Search failed. Try again.");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Tracking ID ${text} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex flex-col">
      {/* Header Banner representing India national colors elegantly */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      {/* Main Navigation */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
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
              <button
                onClick={() => setLangPreference("hinglish")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  langPreference === "hinglish"
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                Hinglish (हिंग्लिश)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Dynamic Tabs & Main Feature Views */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Navigation Tabs Bar */}
          <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <button
              onClick={() => setActiveTab("companion")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "companion"
                  ? "bg-gradient-to-r from-blue-950 to-slate-900 text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask Companion</span>
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "report"
                  ? "bg-gradient-to-r from-blue-950 to-slate-900 text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Report Grievance</span>
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "track"
                  ? "bg-gradient-to-r from-blue-950 to-slate-900 text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Track Status</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* View 1: Ask Companion */}
            {activeTab === "companion" && (
              <motion.div
                key="companion-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                {/* Hero Header */}
                <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white rounded-3xl p-8 shadow-md border border-slate-800 relative overflow-hidden">
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
                      {langPreference === "en" && "Enter any civic query. Unlike black-box chatbots, Nagrik Mitra opens up its reasoning system, mapping rules, services, and clear action steps."}
                      {langPreference === "hi" && "कोई भी सरकारी सेवा या शिकायत दर्ज करने की प्रक्रिया पूछें। सामान्य चैटबॉट्स के विपरीत, नागरिक मित्र आपको अपनी पूरी निर्णय प्रक्रिया दिखाता है।"}
                      {langPreference === "hinglish" && "Civic query type karein. Black-box chatbots ke bajaye, Nagrik Mitra aapko rules, services aur checklists ki complete reasoning step-by-step dikhata hai."}
                    </p>
                  </div>

                  {/* Query Input Form */}
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
                              : langPreference === "hi"
                              ? "पूछें: आधार कार्ड कैसे सुधारें? राशन कार्ड कैसे बनाएं?..."
                              : "Type karein: Aadhaar card me address kaise badle? ya Ration card kaise banaye?..."
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
                            {langPreference === "en" ? "Reasoning..." : langPreference === "hi" ? "सोच रहा है..." : "Reasoning process..."}
                          </>
                        ) : (
                          <>
                            {langPreference === "en" ? "Consult Companion" : langPreference === "hi" ? "सलाह लें" : "Sallah lein"}
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Suggested Queries */}
                  <div className="mt-5 flex flex-wrap gap-2 items-center text-xs relative z-10">
                    <span className="text-slate-400 font-semibold">{langPreference === "en" ? "Try asking:" : langPreference === "hi" ? "जैसे पूछें:" : "Koshish karein:"}</span>
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

                {/* Reasoning results block */}
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
              </motion.div>
            )}

            {/* View 2: Report Civic Issue */}
            {activeTab === "report" && (
              <motion.div
                key="report-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="text-orange-500 h-5 w-5" />
                    <span>Report a Civic Issue</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Describe any local issues (like potholes, garbage piles, or water contamination) in natural language.
                  </p>
                </div>

                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1.5">
                      Issue Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={complaintDesc}
                      onChange={(e) => setComplaintDesc(e.target.value)}
                      placeholder="Explain the problem in detail (e.g. 'There is a huge pothole near the post office causing traffic issues...')"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 dark:text-zinc-50 text-zinc-900 placeholder-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Location / Ward (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={complaintLoc}
                      onChange={(e) => setComplaintLoc(e.target.value)}
                      placeholder="e.g. Sector 62, Noida, near Metro Station"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 dark:text-zinc-50 text-zinc-900 placeholder-zinc-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isReporting || !complaintDesc.trim()}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-orange-400"
                  >
                    {isReporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Running Glass-Box AI Extraction...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Grievance</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Reporting results animation & details */}
                <AnimatePresence mode="wait">
                  {isReporting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-5 border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl flex flex-col items-center py-8 text-center"
                    >
                      <Loader2 className="h-7 w-7 text-indigo-600 animate-spin mb-3" />
                      <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-200">Processing Complaint Data</h5>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                        {LOADING_STEPS[reportStepIdx] || "Analyzing complaint classification..."}
                      </p>
                    </motion.div>
                  )}

                  {reportResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-400">Grievance Filed Successfully!</h4>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                            Your complaint has been processed and saved. Use the tracking ID below to check resolution status.
                          </p>

                          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-900/50 shadow-sm max-w-sm">
                            <span className="font-mono font-extrabold text-base text-zinc-900 dark:text-zinc-50 px-2 flex-1">
                              {reportResult.data.tracking_id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(reportResult.data.tracking_id)}
                              className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 shrink-0"
                            >
                              Copy ID
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Glass box reasoning cards */}
                      <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
                        <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                          AI Metadata Extraction Audit Trail
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Category Match</span>
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1 block">
                              {reportResult.stepInfo.category}
                            </span>
                          </div>
                          <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Extracted Location</span>
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1 block truncate">
                              {reportResult.stepInfo.location}
                            </span>
                          </div>
                          <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Calculated Urgency</span>
                            <span className={`text-sm font-bold mt-1 block ${
                              reportResult.stepInfo.urgency.toLowerCase() === "high"
                                ? "text-red-600 dark:text-red-400"
                                : reportResult.stepInfo.urgency.toLowerCase() === "medium"
                                ? "text-orange-500"
                                : "text-emerald-600"
                            }`}>
                              {reportResult.stepInfo.urgency}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          <strong>Extraction Reasoning:</strong> {reportResult.stepInfo.reasoning}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {reportError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3 mt-4"
                    >
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <span className="text-xs">{reportError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* View 3: Track Complaint */}
            {activeTab === "track" && (
              <motion.div
                key="track-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Activity className="text-blue-600 h-5 w-5" />
                    <span>Track Complaint Status</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Enter the tracking ID of your complaint to check updates. (Try seeded IDs like <strong>NM-2026-0001</strong> or <strong>NM-2026-0002</strong> for testing).
                  </p>
                </div>

                <form onSubmit={handleTrackSubmit} className="flex gap-2">
                  <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-2">
                    <Search className="h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      placeholder="Enter Tracking ID (e.g., NM-2026-0001)"
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isTrackPending || !trackId.trim()}
                    className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center border border-slate-800 shrink-0"
                  >
                    {isTrackPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                  </button>
                </form>

                <AnimatePresence mode="wait">
                  {trackResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 pt-4 border-t border-zinc-200 dark:border-zinc-800"
                    >
                      {/* Complaint Meta Card */}
                      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold font-mono tracking-wider text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200">
                            {trackResult.tracking_id}
                          </span>
                          <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50">
                            Category: {trackResult.category}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Location: {trackResult.location}</span>
                          </p>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 italic pt-1 max-w-lg leading-relaxed">
                            "{trackResult.description}"
                          </p>
                        </div>
                        <div className="sm:text-right flex flex-col justify-between items-start sm:items-end">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            trackResult.urgency.toLowerCase() === "high"
                              ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20"
                              : trackResult.urgency.toLowerCase() === "medium"
                              ? "bg-orange-50 border-orange-200 text-orange-700"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}>
                            Urgency: {trackResult.urgency}
                          </span>
                          
                          <span className="text-[10px] text-zinc-400 mt-2 block">
                            Logged: {new Date(trackResult.created_at || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Status Visual Stepper */}
                      <div>
                        <h5 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-5">
                          Resolution Status Roadmap
                        </h5>
                        
                        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 sm:gap-0 px-4">
                          
                          {/* Stepper background line */}
                          <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 hidden sm:block z-0" />
                          
                          {/* Visual Steps mapping */}
                          {["Submitted", "Under Review", "Dispatched", "Resolved"].map((step, idx, arr) => {
                            const statuses = ["submitted", "under review", "dispatched", "resolved"];
                            const currentIdx = statuses.indexOf(trackResult.status.toLowerCase());
                            const stepIdx = statuses.indexOf(step.toLowerCase());
                            const isActive = stepIdx <= currentIdx;
                            const isCompleted = stepIdx < currentIdx;
                            
                            return (
                              <div key={idx} className="flex sm:flex-col items-center gap-3 sm:gap-2 z-10 w-full sm:w-auto relative">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                                  isCompleted
                                    ? "bg-emerald-600 border-emerald-500 text-white"
                                    : isActive
                                    ? "bg-orange-500 border-orange-400 text-white animate-pulse"
                                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                                }`}>
                                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                                </div>
                                <div className="text-left sm:text-center">
                                  <span className={`text-xs font-bold block ${
                                    isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400"
                                  }`}>
                                    {step}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 block sm:hidden">
                                    {isCompleted ? "Completed" : isActive ? "Active Stage" : "Pending"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Informational disclaimer */}
                      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex gap-2.5">
                        <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-xs text-blue-800 dark:text-blue-400 leading-normal">
                          This status reflects live updates from district officers. Grievances are targeted for evaluation within 14 business days.
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {trackError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3"
                    >
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <span className="text-xs">{trackError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
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
