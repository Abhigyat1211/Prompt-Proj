"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, FileText, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

type DocItem = {
  id: string;
  label: string;
  note?: string;
};

type Service = {
  id: string;
  name: string;
  emoji: string;
  docs: DocItem[];
  tip: string;
};

const SERVICES: Service[] = [
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    emoji: "🪪",
    tip: "Corrections take 7–14 days. Always carry original supporting documents to the Aadhaar Seva Kendra.",
    docs: [
      { id: "a1", label: "Proof of Identity (Voter ID / PAN / Passport)", note: "Any one required" },
      { id: "a2", label: "Proof of Address (Bank passbook / Electricity bill)", note: "Should be <3 months old" },
      { id: "a3", label: "Proof of Date of Birth (Birth Certificate / SSLC)", note: "For DOB correction" },
      { id: "a4", label: "Mobile number registered with Aadhaar", note: "OTP will be sent here" },
      { id: "a5", label: "Filled Aadhaar Enrolment/Correction Form", note: "Available at Seva Kendra" },
    ],
  },
  {
    id: "ration",
    name: "Ration Card",
    emoji: "🍚",
    tip: "Apply online at your state's Food & Civil Supplies portal. Processing time: 15–30 days.",
    docs: [
      { id: "r1", label: "Aadhaar Card (all family members)", note: "Mandatory for all members" },
      { id: "r2", label: "Existing ration card (if modifying)", note: "For update/correction" },
      { id: "r3", label: "Proof of Residence (electricity bill / rent agreement)", note: "<3 months old" },
      { id: "r4", label: "Passport-size photographs (head of household)", note: "2 copies" },
      { id: "r5", label: "Income certificate / BPL declaration", note: "From tehsildar if applicable" },
      { id: "r6", label: "Caste certificate (if applying for SC/ST category)", note: "Optional, category-specific" },
    ],
  },
  {
    id: "pan",
    name: "PAN Card",
    emoji: "💳",
    tip: "Apply via NSDL or UTIITSL portal. PAN is delivered within 15–20 working days.",
    docs: [
      { id: "p1", label: "Proof of Identity (Aadhaar / Voter ID / Passport)", note: "Any one" },
      { id: "p2", label: "Proof of Address (Bank statement / Aadhaar)", note: "Any one" },
      { id: "p3", label: "Proof of Date of Birth (Birth certificate / SSLC marksheet)", note: "Any one" },
      { id: "p4", label: "Passport-size photograph", note: "1 recent colour photo" },
      { id: "p5", label: "PAN application fee (₹107 India / ₹1,017 abroad)", note: "Online payment" },
    ],
  },
  {
    id: "passport",
    name: "Passport",
    emoji: "📕",
    tip: "Book appointment at Passport Seva Kendra. Fresh passport: 30–45 days. Tatkal: 7–14 days.",
    docs: [
      { id: "ps1", label: "Aadhaar Card", note: "Primary identity proof" },
      { id: "ps2", label: "Proof of Address (Aadhaar / utility bill)", note: "Current address" },
      { id: "ps3", label: "Proof of Date of Birth (Birth certificate / SSLC)", note: "Any one" },
      { id: "ps4", label: "Old passport (if renewal)", note: "Original + self-attested copies of first/last page" },
      { id: "ps5", label: "Passport-size photos (5.1 × 5.1 cm, white background)", note: "4 copies" },
      { id: "ps6", label: "Filled online application form (PSK portal)", note: "Application Reference Number required at appointment" },
    ],
  },
  {
    id: "birth",
    name: "Birth Certificate",
    emoji: "👶",
    tip: "Apply at municipal corporation / panchayat office. Births registered within 21 days are free of charge.",
    docs: [
      { id: "b1", label: "Hospital discharge summary / birth slip", note: "Issued by hospital at birth" },
      { id: "b2", label: "Parent Aadhaar Cards", note: "Both father and mother" },
      { id: "b3", label: "Parent Marriage Certificate", note: "Optional but recommended" },
      { id: "b4", label: "Affidavit (if registering after 30 days)", note: "Notarized affidavit required" },
    ],
  },
  {
    id: "income",
    name: "Income Certificate",
    emoji: "📄",
    tip: "Apply through the state's Seva Kendra or online e-district portal. Valid for 6 months–1 year.",
    docs: [
      { id: "i1", label: "Aadhaar Card", note: "Mandatory" },
      { id: "i2", label: "Self-declaration of income / salary slip", note: "Last 3 months" },
      { id: "i3", label: "Bank statement", note: "Last 6 months" },
      { id: "i4", label: "Ration card (if BPL)", note: "Optional, category-specific" },
      { id: "i5", label: "Application fee (varies by state)", note: "Check state portal" },
    ],
  },
];

type Lang = "en" | "hi" | "hinglish";
const RECKONER_TEXT: Record<string, Record<Lang, string>> = {
  title: { en: "Document Ready-Reckoner", hi: "दस्तावेज़ रेडी-रेकनर", hinglish: "Document Ready-Reckoner" },
  subtitle: {
    en: "Check what you need before you go",
    hi: "जाने से पहले जांच लें कि आपको क्या चाहिए",
    hinglish: "Jaane se pehle check karein kya chahiye"
  },
};

export default function DocumentReckoner({ lang = "en" }: { lang?: Lang }) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(true);

  const service = SERVICES.find((s) => s.id === selectedService);
  const totalDocs = service?.docs.length ?? 0;
  const checkedCount = service ? service.docs.filter((d) => checked[d.id]).length : 0;
  const progress = totalDocs > 0 ? (checkedCount / totalDocs) * 100 : 0;
  const isReady = checkedCount === totalDocs && totalDocs > 0;

  const toggleDoc = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const reset = () => {
    setChecked({});
    setSelectedService(null);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50">
              {RECKONER_TEXT.title[lang]}
            </p>
            <p className="text-[10px] text-zinc-400">
              {RECKONER_TEXT.subtitle[lang]}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Service Selector */}
              <div className="grid grid-cols-3 gap-1.5">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedService(s.id);
                      setChecked({});
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                      selectedService === s.id
                        ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700"
                        : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    <span className="text-lg leading-none">{s.emoji}</span>
                    <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300 leading-tight">
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Checklist */}
              <AnimatePresence mode="wait">
                {service && (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-2"
                  >
                    {/* Progress bar */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                        {checkedCount}/{totalDocs} docs ready
                      </span>
                      <button
                        onClick={reset}
                        className="text-[10px] text-zinc-400 hover:text-zinc-600 flex items-center gap-1"
                      >
                        <RotateCcw className="h-2.5 w-2.5" />
                        Reset
                      </button>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mb-3">
                      <motion.div
                        className={`h-1.5 rounded-full transition-all ${
                          isReady ? "bg-emerald-500" : "bg-indigo-500"
                        }`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    {/* Document checklist */}
                    {service.docs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => toggleDoc(doc.id)}
                        className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                          checked[doc.id]
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50"
                            : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                        }`}
                      >
                        {checked[doc.id] ? (
                          <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="h-4 w-4 text-zinc-300 dark:text-zinc-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p
                            className={`text-[11px] font-semibold leading-tight ${
                              checked[doc.id]
                                ? "text-emerald-800 dark:text-emerald-300 line-through"
                                : "text-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            {doc.label}
                          </p>
                          {doc.note && (
                            <p className="text-[9px] text-zinc-400 mt-0.5">{doc.note}</p>
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Completion state */}
                    <AnimatePresence>
                      {isReady && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-center"
                        >
                          <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                            ✅ You're all set!
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                            All documents ready for {service.name}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Pro tip */}
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl">
                      <p className="text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed">
                        <span className="font-bold">💡 Tip: </span>
                        {service.tip}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!service && (
                <p className="text-[11px] text-zinc-400 text-center py-3">
                  Select a service above to see required documents
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
