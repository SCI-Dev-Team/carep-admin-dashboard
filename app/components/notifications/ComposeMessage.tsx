"use client";

import React from "react";
import { MESSAGE_TEMPLATES } from "./types";
import type { MessageTemplate } from "./types";

type ComposeMessageProps = {
  subject: string;
  message: string;
  includePriceForm: boolean;
  includeVoice: boolean;
  selectedTemplateId: string;
  sending: boolean;
  selectedCount: number;
  onSubjectChange: (v: string) => void;
  onMessageChange: (v: string) => void;
  onIncludePriceFormChange: (v: boolean) => void;
  onIncludeVoiceChange: (v: boolean) => void;
  onTemplateSelect: (t: MessageTemplate) => void;
  onSend: () => void;
};

export default function ComposeMessage({
  subject,
  message,
  includePriceForm,
  includeVoice,
  selectedTemplateId,
  sending,
  selectedCount,
  onSubjectChange,
  onMessageChange,
  onIncludePriceFormChange,
  onIncludeVoiceChange,
  onTemplateSelect,
  onSend,
}: ComposeMessageProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Compose Message</h2>
        <p className="text-sm text-slate-500">Use a template or write your notification message</p>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Quick templates</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => {
              const t = MESSAGE_TEMPLATES.find((x) => x.id === e.target.value);
              if (t) onTemplateSelect(t);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
          >
            {MESSAGE_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">Choose a template to fill subject and message (Khmer)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Subject (Optional)</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Enter subject..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Write your message here..."
            rows={8}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">{message.length} characters</p>
        </div>
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <input
            type="checkbox"
            id="includePriceForm"
            checked={includePriceForm}
            onChange={(e) => onIncludePriceFormChange(e.target.checked)}
            className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="includePriceForm" className="flex-1 cursor-pointer">
            <span className="text-sm font-medium text-emerald-800">Include Price Input Form</span>
            <p className="text-xs text-emerald-600">In the mini app, farmers can upload a photo of prices or fill the form manually</p>
          </label>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <input
            type="checkbox"
            id="includeVoice"
            checked={includeVoice}
            onChange={(e) => onIncludeVoiceChange(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="includeVoice" className="flex-1 cursor-pointer">
            <span className="text-sm font-medium text-slate-800">Also send as voice message</span>
            <p className="text-xs text-slate-600">Convert message to speech and send as audio to Telegram (Khmer TTS)</p>
          </label>
        </div>
        <button
          onClick={onSend}
          disabled={sending || selectedCount === 0 || !message.trim()}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Sending...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              Send via Telegram ({selectedCount} recipients)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
