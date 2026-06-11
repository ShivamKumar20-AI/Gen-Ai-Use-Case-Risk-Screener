/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Lock,
  UserCheck,
  Download,
  Trash2,
  History,
  Sparkles,
  RefreshCw,
  Plus,
  Scale,
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  Clipboard,
  ClipboardList,
  Info
} from "lucide-react";
import { UseCaseAssessment, BusinessFunction, SavedAssessment } from "./types";

const SAMPLES = [
  {
    title: "HR Resume Scoring and Candidate Filtering Tool",
    businessFunction: "HR" as BusinessFunction,
    description: "An automated candidate evaluation tool that processes resumes uploaded by job applicants. The system uses a large language model to parse work histories, assign suitability grades, summarize candidate skills, and rank users. To speed up recruiting, recruiters directly paste applicant contact sheets with phone numbers and emails. The server runs on a external public cloud endpoint without enterprise security guarantees.",
  },
  {
    title: "Proprietary Codebase Search and Internal Developer Assistant",
    businessFunction: "Operations" as BusinessFunction,
    description: "An internal engineering helper powered by Retrieval-Augmented Generation (RAG). It accepts queries from developers to locate existing APIs and utilities within our private repository codebase, and provides automated explanation of error traces. System access is restricted to authenticated active personnel via corporate SSO. The application processing is air-gapped; absolutely no candidate PII or client telemetry is involved.",
  },
  {
    title: "Automated Customer Support Dispute Email Author",
    businessFunction: "Customer Support" as BusinessFunction,
    description: "A customer-facing system designed to automatically respond to corporate billing disputes. The software reads transaction disputes and fetches users' historical order record, complete home addresses, and payment files from our legacy ERP database. It then automatically drafts and dispatches final ruling emails into the customer’s inbox without manual human-in-the-loop review to guarantee sub-minute query closure.",
  }
];

export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [businessFunction, setBusinessFunction] = useState<BusinessFunction>("Other");
  
  const [assessment, setAssessment] = useState<UseCaseAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [history, setHistory] = useState<SavedAssessment[]>([]);
  const [viewingSavedId, setViewingSavedId] = useState<string | null>(null);

  // Load history from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gai_risk_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history from local storage", e);
    }
  }, []);

  // Cycle loading steps to make progress feel highly professional and organic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const saveToHistory = (newAssessment: UseCaseAssessment) => {
    const freshRecord: SavedAssessment = {
      id: Math.random().toString(36).substring(2, 11),
      title: title.trim() || `Assessment for ${businessFunction}`,
      description: description.trim(),
      businessFunction,
      createdAt: new Date().toISOString(),
      assessment: newAssessment
    };
    
    const updatedHistory = [freshRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("gai_risk_history", JSON.stringify(updatedHistory));
    setViewingSavedId(freshRecord.id);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = history.filter((item) => item.id !== id);
    setHistory(filtered);
    localStorage.setItem("gai_risk_history", JSON.stringify(filtered));
    if (viewingSavedId === id) {
      setViewingSavedId(null);
      setAssessment(null);
    }
  };

  const handleSampleSelect = (sample: typeof SAMPLES[0]) => {
    setTitle(sample.title);
    setBusinessFunction(sample.businessFunction);
    setDescription(sample.description);
    // Clear old assessment to prompt fresh clicks
    setViewingSavedId(null);
    setAssessment(null);
    setError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe the generative AI use case before running analysis.");
      return;
    }

    setIsLoading(true);
    setAssessment(null);
    setError(null);
    setViewingSavedId(null);

    try {
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          businessFunction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data: UseCaseAssessment = await response.json();
      setAssessment(data);
      saveToHistory(data);
    } catch (err: any) {
      console.error("Assessment retrieval failed:", err);
      setError(err?.message || "Connection failure with compliance endpoint. Check network setup and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setBusinessFunction("Other");
    setAssessment(null);
    setViewingSavedId(null);
    setError(null);
  };

  const loadHistoryItem = (item: SavedAssessment) => {
    setTitle(item.title);
    setBusinessFunction(item.businessFunction);
    setDescription(item.description);
    setAssessment(item.assessment);
    setViewingSavedId(item.id);
    setError(null);
  };

  const copyToClipboard = () => {
    if (!assessment) return;
    const reportText = `
=== GENAI USE CASE COMPLIANCE SCREENING ===
Use Case: ${title || "Untitled Use Case"}
Business Function: ${businessFunction}
Overall Risk Rating: ${assessment.overallRiskRating.toUpperCase()}

--- USE CASE SUMMARY ---
${assessment.summary}

--- COMPLIANCE / DATA CATEGORIES ---
${assessment.dataCategories.join(", ")}

--- KEY RISK FLAGS IDENTIFIED ---
${assessment.riskFlags.map((r, i) => `${i + 1}. ${r}`).join("\n")}

--- SUGGESTED REgulatory & SECURITY CONTROLS ---
${assessment.suggestedControls.map((c, i) => `${i + 1}. ${c}`).join("\n")}

--- CRITICAL AUDIT / FOLLOW-UP QUESTIONS ---
${assessment.humanReviewQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

--- RATING JUSTIFICATION ---
${assessment.ratingExplanation}

Disclaimer: This report is a first-pass compliance screening guide for compliance specialists. It is not formal legal advice.
    `;
    
    navigator.clipboard.writeText(reportText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // UI colors depending on state risk level
  const getRiskStyles = (rating?: string) => {
    const r = rating?.toLowerCase() || "";
    if (r.includes("high")) {
      return {
        bg: "bg-red-50/70 border-red-200 text-red-700",
        badge: "bg-red-100/80 text-red-800 border-red-200",
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        accentBar: "border-l-4 border-red-500",
        ring: "focus:ring-red-400"
      };
    } else if (r.includes("medium")) {
      return {
        bg: "bg-amber-50/70 border-amber-200 text-amber-800",
        badge: "bg-amber-100/80 text-amber-900 border-amber-200",
        icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
        accentBar: "border-l-4 border-amber-500",
        ring: "focus:ring-amber-400"
      };
    } else {
      return {
        bg: "bg-emerald-50/70 border-emerald-200 text-emerald-800",
        badge: "bg-emerald-100/80 text-emerald-900 border-emerald-200",
        icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
        accentBar: "border-l-4 border-emerald-500",
        ring: "focus:ring-emerald-400"
      };
    }
  };

  const currentRisk = getRiskStyles(assessment?.overallRiskRating);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Disclaimer Notice Banner */}
      <div id="legal-disclaimer-banner" className="mb-6 bg-slate-100 border border-slate-200 rounded-xl p-3 px-4 flex items-start gap-3">
        <Scale className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-normal font-sans">
          <strong className="text-slate-800 font-medium font-sans">Regulatory Advisory Notice:</strong> This toolkit is designed for use by AI risk and compliance governance specialists as part of preliminary, first-pass educational reviews. Outputs generate diagnostic assessments but <strong>do not constitute legal counsel, compliance sign-offs, or binding audits</strong>. Always consult your legal department before production launches.
        </p>
      </div>

      {/* Main App Title Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600 stroke-[1.8]" />
            GenAI Use Case Risk Screener
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-sans">
            First-pass systemic compliance, privacy, and technical risk screening aligned to emerging AI model governance frameworks.
          </p>
        </div>
        
        {/* Actions or Quick Info */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={resetForm}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Load Blank Form
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Intake Form (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Quick-select Templates */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3 font-sans">
              Quick-Load Intake Templates
            </span>
            <div className="flex flex-col gap-2">
              {SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleSelect(sample)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 text-xs transition-all flex justify-between items-center group"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-700 block text-xs truncate group-hover:text-indigo-600">
                      {sample.title}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] uppercase">
                      Class: {sample.businessFunction}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Core Intake Questionnaire */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-800 font-sans">Use Case Assessment Input</h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Optional Title input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                  Proposed System Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Employee Evaluation Assist Bot"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              {/* Business Function Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                  Business Function Group *
                </label>
                <div className="relative">
                  <select
                    value={businessFunction}
                    onChange={(e) => setBusinessFunction(e.target.value as BusinessFunction)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 hover:bg-slate-50 cursor-pointer focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans appearance-none"
                  >
                    <option value="HR">HR & Recruitment</option>
                    <option value="Security">Security & Cyber Defense</option>
                    <option value="Compliance">Compliance & Auditors</option>
                    <option value="Marketing">Marketing, Sales & Creative Content</option>
                    <option value="Operations">Operations, Engineering & IT Infrastructure</option>
                    <option value="Customer Support">Customer Support chatbot & Relations</option>
                    <option value="Other">Other / General Operations</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Detailed Description Text Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                  Deployment Description & System Context *
                </label>
                <textarea
                  placeholder="Provide details on: Which data is cataloged? Who uses the system outputs? Are LLM answers sent direct to the public without supervision? Is sensitive customer code/PII copied or referenced?"
                  rows={7}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all leading-relaxed font-sans font-normal"
                />
                <span className="text-[10px] text-slate-400 block mt-1 leading-normal font-sans">
                  * Try to specify: training data, operational host (external vs. VPC), customer exposure levels, and current guardrails.
                </span>
              </div>

              {/* Actions */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                      Analyzing Use Case...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4.5 h-4.5" />
                      Generate Risk Assessment
                    </>
                  )}
                </button>
              </div>

              {/* Error messages */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs leading-normal font-sans">
                  <span className="font-semibold block mb-0.5 font-sans">• Assessment Failure</span>
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Compliance History Log panel (Local) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3 font-sans flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              Compliance Screening History ({history.length})
            </span>
            
            {history.length === 0 ? (
              <p className="text-xs italic text-slate-400 leading-normal p-2 bg-slate-50/50 rounded-lg text-center font-sans">
                No past evaluations detected on this browser session.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {history.map((record) => {
                  const savedStyles = getRiskStyles(record.assessment.overallRiskRating);
                  const isCurrent = record.id === viewingSavedId;
                  
                  return (
                    <div
                      key={record.id}
                      onClick={() => loadHistoryItem(record)}
                      className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex justify-between items-center cursor-pointer ${
                        isCurrent 
                          ? "bg-indigo-50/70 border-indigo-200 shadow-3xs" 
                          : "bg-slate-50/45 border-slate-100 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="truncate pr-3">
                        <div className="font-medium text-slate-700 truncate font-sans">
                          {record.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded-sm text-[9px] uppercase font-semibold font-mono border ${savedStyles.badge}`}>
                            {record.assessment.overallRiskRating} Risk
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteHistoryItem(record.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-sm shrink-0 transition-colors"
                        title="Delete evaluation log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Evaluation Panel (lg:col-span-12) */}
        <div className="lg:col-span-7 flex flex-col min-h-[450px]">
          
          <AnimatePresence mode="wait">
            
            {/* 1. Loading Visualizer */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center my-auto shadow-xs w-full"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                  <div className="absolute inset-x-0 inset-y-0 m-auto w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                    <Shield className="w-4 h-4 text-indigo-500" />
                  </div>
                </div>

                <h3 className="text-base font-display font-semibold text-slate-800 mb-2 font-sans">
                  Generating AI Use Case Assessment
                </h3>
                
                {/* Simulated Progressive Pipeline Indicators */}
                <div className="max-w-xs w-full bg-slate-50 rounded-lg p-3 text-xs text-left border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${loadingStep >= 0 ? "bg-indigo-600 animate-pulse" : "bg-slate-300"}`} />
                    <span className={`font-sans ${loadingStep === 0 ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                      1. Mapping data dependencies
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${loadingStep >= 1 ? "bg-indigo-600 animate-pulse" : "bg-slate-300"}`} />
                    <span className={`font-sans ${loadingStep === 1 ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                      2. Checking compliance anomalies
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${loadingStep >= 2 ? "bg-indigo-600 animate-pulse" : "bg-slate-300"}`} />
                    <span className={`font-sans ${loadingStep === 2 ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                      3. Formulating security controls
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${loadingStep >= 3 ? "bg-indigo-600 animate-pulse" : "bg-slate-300"}`} />
                    <span className={`font-sans ${loadingStep === 3 ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                      4. Assembling review questions
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-4 max-w-sm italic font-sans leading-normal">
                  Our professional compliance models are analyzing privacy implications, administrative boundaries, and mitigation protocols.
                </p>
              </motion.div>
            )}

            {/* 2. Empty / Instructions State */}
            {!isLoading && !assessment && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-50 border border-slate-200/60 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center my-auto w-full"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 mb-4 shadow-3xs">
                  <ClipboardList className="w-6 h-6 text-slate-400 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-display font-semibold text-slate-700 mb-1 font-sans">
                  Ready for GRC Compliance Evaluation
                </h3>
                <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6 font-sans">
                  Fill out the Intake Form on the left or select one of our prepackaged business case templates to generate a structured AI risk rating.
                </p>

                {/* Information cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg text-left">
                  <div className="bg-white border border-slate-100 rounded-lg p-3">
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-indigo-500 block mb-1 font-sans">
                      Risk Classification
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-normal">
                      Evaluates models and data configurations to generate Low, Medium, or High compliance thresholds.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-lg p-3">
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-indigo-500 block mb-1 font-sans">
                      Mitigation Controls
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-normal">
                      Provides instant recommendations for regulatory audit gates, data filters, and organizational guardrails.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Real Assessment Result Panel */}
            {!isLoading && assessment && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print:border-none print:shadow-none font-sans"
              >
                
                {/* Result Header Segment */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
                      GRC screening output
                    </span>
                    <h2 className="text-lg font-display font-semibold text-slate-800 truncate font-sans">
                      {title || `Assessment: ${businessFunction}`}
                    </h2>
                  </div>

                  {/* Rating indicator */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs text-slate-500 font-sans">Overall Class Assessment:</span>
                    <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 text-xs font-semibold ${currentRisk.badge}`}>
                      {currentRisk.icon}
                      {assessment.overallRiskRating} Risk
                    </div>
                  </div>
                </div>

                {/* Result Assessment Summary Block */}
                <div className="p-6 space-y-6">
                  
                  {/* Summary Block */}
                  <div className={`${currentRisk.accentBar} pl-4 bg-slate-50 p-4 rounded-r-lg`}>
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      Use Case Summary Analysis
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed font-sans">
                      {assessment.summary}
                    </p>
                    {assessment.ratingExplanation && (
                      <p className="text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60 leading-relaxed font-sans">
                        <strong className="text-slate-600 font-medium">Rating Justification:</strong> {assessment.ratingExplanation}
                      </p>
                    )}
                  </div>

                  {/* Columns for Data categories and key Risk flags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Data Categories Involved */}
                    <div className="bg-white border border-slate-100 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 font-sans flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        Data Categories Involved
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {assessment.dataCategories.map((category, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-50/70 text-indigo-950 border border-indigo-100 rounded-full px-2.5 py-0.5 text-xs font-medium font-sans"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Risk Flags */}
                    <div className="bg-white border border-slate-100 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 font-sans flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                        Compliance / Privacy Risk Flags
                      </h4>
                      <ul className="space-y-2">
                        {assessment.riskFlags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed font-sans">
                            <span className="text-amber-500 font-semibold shrink-0 mt-0.5">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Suggested Controls Section */}
                  <div className="border border-slate-100 rounded-xl p-5 bg-emerald-50/15">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3.5 font-sans flex items-center gap-1.5 border-b border-emerald-100/60 pb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Recommended Compliance Controls
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assessment.suggestedControls.map((control, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start bg-white p-3 border border-slate-150 rounded-lg shadow-3xs">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] text-emerald-650 font-bold font-mono">{idx + 1}</span>
                          </div>
                          <span className="text-xs text-slate-600 leading-normal font-sans">
                            {control}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Human Auditor Review Questions */}
                  <div className="border border-slate-100 rounded-xl p-5 bg-indigo-50/15">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3.5 font-sans flex items-center gap-1.5 border-b border-indigo-100/60 pb-2">
                      <UserCheck className="w-4 h-4 text-indigo-500" />
                      Critical Auditor Verification Questions
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {assessment.humanReviewQuestions.map((question, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-2.5 bg-white border border-slate-100 rounded-lg hover:border-indigo-100 transition-colors">
                          <span className="text-xs font-mono font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-sm shrink-0">
                            Q{idx + 1}
                          </span>
                          <span className="text-xs text-slate-600 leading-normal font-sans">
                            {question}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Result Footer with Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-400 max-w-[280px] leading-tight font-sans">
                      This screening can be downloaded or printed locally using standard browser printing.
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Copy to Clipboard */}
                    <button
                      onClick={copyToClipboard}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium text-xs hover:bg-slate-50 hover:border-slate-350 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                          Copied Result!
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-4 h-4 text-slate-500" />
                          Copy Raw Text
                        </>
                      )}
                    </button>

                    {/* Print / Export Report (Works via window.print CSS rules) */}
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-905 text-white font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <Download className="w-4 h-4 text-slate-300" />
                      Print / Export PDF
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

      {/* Styled print CSS rules */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          #legal-disclaimer-banner,
          button,
          input,
          select,
          textarea,
          form,
          header,
          .lg\\:col-span-5 {
            display: none !important;
          }
          .lg\\:col-span-12,
          .lg\\:col-span-7 {
            width: 100% !important;
            flex: none !important;
            grid-column: span 12 / span 12 !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>

    </div>
  );
}
