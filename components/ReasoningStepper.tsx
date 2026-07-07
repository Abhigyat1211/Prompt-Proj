"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  FileText, 
  Info, 
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { ReasoningResult } from "../app/actions/chat";

interface ReasoningStepperProps {
  result: ReasoningResult;
}

export default function ReasoningStepper({ result }: ReasoningStepperProps) {
  const {
    detectedLanguage,
    queryUnderstanding,
    serviceMatch,
    plainExplanation,
    actionSteps,
    disclaimer,
    isMocked
  } = result;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.35, // Delights the user by showing cards in sequence
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 80, damping: 15 }
    },
  };

  const steps = [
    {
      title: "1. Language & Query Understanding",
      subtitle: `Detected Language: ${detectedLanguage}`,
      icon: <HelpCircle className="h-6 w-6 text-orange-500" />,
      content: queryUnderstanding,
      colorClass: "border-l-4 border-orange-500 bg-orange-50/50 dark:bg-orange-950/20",
    },
    {
      title: "2. Relevant Department & Service Match",
      subtitle: "Official Jurisdiction",
      icon: <Layers className="h-6 w-6 text-blue-600" />,
      content: serviceMatch,
      colorClass: "border-l-4 border-blue-600 bg-blue-50/50 dark:bg-blue-950/20",
    },
    {
      title: "3. Plain-Language Explanation",
      subtitle: "The Bureaucracy Simplified",
      icon: <Info className="h-6 w-6 text-emerald-600" />,
      content: plainExplanation,
      colorClass: "border-l-4 border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20",
    },
    {
      title: "4. Suggested Action Steps",
      subtitle: "Follow this checklist",
      icon: <ClipboardList className="h-6 w-6 text-indigo-600" />,
      content: (
        <ul className="space-y-3 mt-2">
          {actionSteps.map((step, idx) => (
            <motion.li 
              key={idx} 
              className="flex items-start gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 shadow-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + idx * 0.15 }}
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">{step}</span>
            </motion.li>
          ))}
        </ul>
      ),
      colorClass: "border-l-4 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <span>Glass-Box AI Reasoning Trail</span>
          {isMocked && (
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-normal px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
              Demo Sandbox Mode
            </span>
          )}
        </h3>
        <span className="text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 rounded-md border border-orange-100 dark:border-orange-900/50">
          Reasoning Speed: Instant
        </span>
      </div>

      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className={`p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm ${step.colorClass}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
                {step.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{step.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="text-zinc-700 dark:text-zinc-300 text-sm pl-1">
              {typeof step.content === "string" ? (
                <p className="leading-relaxed font-medium">{step.content}</p>
              ) : (
                step.content
              )}
            </div>
          </motion.div>
        ))}

        {/* Disclaimer card */}
        <motion.div
          variants={itemVariants}
          className="mt-6 p-4 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 flex items-start gap-3"
        >
          <Info className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-xs text-red-800 dark:text-red-400 uppercase tracking-wide">Important Disclaimer</h5>
            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed mt-0.5">{disclaimer}</p>
            <a 
              href="https://www.india.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold inline-flex items-center gap-1 mt-2 hover:underline"
            >
              Verify on National Portal of India <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
