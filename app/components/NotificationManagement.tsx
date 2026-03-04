"use client";

import React, { useEffect, useState } from "react";

type FarmerLead = {
  user_id: number;
  gender?: string;
  age_range?: string;
  location?: string;
  created_at?: string;
  telegram_chat_id?: string;
};

type User = {
  user_id: number;
  gender?: string;
  age_range?: string;
  location?: string;
  role?: string;
  created_at?: string;
  telegram_chat_id?: string;
};

type NotificationHistory = {
  id: number;
  user_id: number;
  message: string;
  sent_at: string;
  status: string;
};

type FarmerResponse = {
  id: number;
  telegram_user_id: number;
  telegram_chat_id: number;
  sender_name: string;
  message: string;
  received_at: string;
  is_read: boolean;
  approval_status: "pending" | "approved" | "rejected";
  edited_message: string | null;
  approved_at: string | null;
};

type MessageTemplate = {
  id: string;
  label: string;
  subject: string;
  message: string;
  includePriceForm: boolean;
};

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "ask_prices",
    label: "សុំតម្លៃថ្ងៃនេះ – សាឡាត ត្រសក់ ខាប់ផ្កាយ... (Ask today's prices)",
    subject: "សុំតម្លៃអាហារបន្លៃ",
    message: "សួស្តី! យើងចង់សុំតម្លៃអាហារបន្លៃថ្ងៃនេះពីអ្នក រួមមាន៖ សាឡាត (cabbage) ត្រសក់ (cucumber) ខាប់ផ្កាយ (cauliflower) និងអាហារបន្លៃផ្សេងទៀត។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីដាក់ស្នើតម្លៃរបស់អ្នក។ សូមអរគុណ!",
    includePriceForm: true,
  },
  {
    id: "ask_weekly_prices",
    label: "សុំតម្លៃប្រចាំសប្តាហ៍ – សាឡាត ត្រសក់ ខាប់ផ្កាយ... (Ask weekly prices)",
    subject: "សុំតម្លៃប្រចាំសប្តាហ៍",
    message: "សួស្តី! យើងចង់ប្រមូលតម្លៃអាហារបន្លៃប្រចាំសប្តាហ៍ រួមមាន សាឡាត ត្រសក់ ខាប់ផ្កាយ និងអាហារបន្លៃផ្សេងទៀត។ សូមដាក់ស្នើតម្លៃរបស់អ្នកតាមរយៈប៊ូតុងខាងក្រោម។",
    includePriceForm: true,
  },
  {
    id: "reminder_submit",
    label: "រំលឹកដាក់ស្នើតម្លៃ – សាឡាត ត្រសក់ ខាប់ផ្កាយ... (Reminder)",
    subject: "រំលឹកដាក់ស្នើតម្លៃ",
    message: "សួស្តី! យើងនឹកឃើញថាអ្នកមិនទាន់ដាក់ស្នើតម្លៃអាហារបន្លៃ (សាឡាត ត្រសក់ ខាប់ផ្កាយ...) នៅឡើយ។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីដាក់ស្នើ។ សូមអរគុណ!",
    includePriceForm: true,
  },
  {
    id: "thank_you",
    label: "អរគុណ (Thank you)",
    subject: "អរគុណ",
    message: "សូមអរគុណចំពោះការចូលរួមរបស់អ្នក! យើងធ្វើការជាមួយអ្នកដើម្បីធ្វើឱ្យវិស័យកសិកម្មប្រសើរឡើង។",
    includePriceForm: false,
  },
  {
    id: "general_update",
    label: "ដំណឹងទូទៅ (General update)",
    subject: "ដំណឹង",
    message: "សួស្តី! នេះជាដំណឹងពីក្រុមយើង។ សូមតាមដាននិងឆ្លើយតបយើងប្រសិនបើអ្នកមានចម្ងល់។",
    includePriceForm: false,
  },
  {
    id: "custom",
    label: "សរសេរខ្លួនឯង (Write your own)",
    subject: "",
    message: "",
    includePriceForm: true,
  },
];

export default function NotificationManagement({ onClose }: { onClose: () => void }) {
  const [farmerLeads, setFarmerLeads] = useState<FarmerLead[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [farmerResponses, setFarmerResponses] = useState<FarmerResponse[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [includePriceForm, setIncludePriceForm] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("custom");
  const [activeTab, setActiveTab] = useState<"notifications" | "history" | "responses">("notifications");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const HISTORY_PAGE_SIZE = 20;

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<FarmerResponse | null>(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [approving, setApproving] = useState<number | null>(null);

  // Structured edit state
  type PriceItem = { vegetable: string; price: string; unit: string };
  const [editLocation, setEditLocation] = useState("");
  const [editPriceItems, setEditPriceItems] = useState<PriceItem[]>([]);
  const [editNotes, setEditNotes] = useState("");

  // Broadcast modal state
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastingResponse, setBroadcastingResponse] = useState<FarmerResponse | null>(null);
  const [broadcastSelectedUsers, setBroadcastSelectedUsers] = useState<Set<number>>(new Set());
  const [broadcastSelectAll, setBroadcastSelectAll] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allUsersLoading, setAllUsersLoading] = useState(false);

  // Parse message into structured format
  function parseMessageToStructured(msg: string): { location: string; items: PriceItem[]; notes: string } {
    const lines = msg.split("\n").map((l) => l.trim()).filter(Boolean);
    let location = "";
    const items: PriceItem[] = [];
    let notes = "";
    let inNotes = false;

    for (const line of lines) {
      // Skip header line
      if (line.includes("Price Report") || line.includes("📊")) continue;

      // Check for location (starts with 📍 or contains common location keywords)
      if (line.startsWith("📍") || line.toLowerCase().includes("location:")) {
        location = line.replace("📍", "").replace(/location:/i, "").trim();
        continue;
      }

      // Check for notes section
      if (line.toLowerCase().includes("notes:") || line.startsWith("📝")) {
        inNotes = true;
        notes = line.replace("📝", "").replace(/notes:/i, "").trim();
        continue;
      }

      if (inNotes) {
        notes += " " + line;
        continue;
      }

      // Parse vegetable price lines (e.g., "Cauliflower: 1998 KHR/kg" or "Cabbage: 2500 រៀល/kg")
      const priceMatch = line.match(/^([^:]+):\s*([\d,]+)\s*(KHR|រៀល|USD|\$)?\/?(kg|g|lb|piece)?/i);
      if (priceMatch) {
        items.push({
          vegetable: priceMatch[1].trim(),
          price: priceMatch[2].replace(/,/g, ""),
          unit: priceMatch[4] || "kg",
        });
      }
    }

    return { location, items, notes: notes.trim() };
  }

  // Reconstruct message from structured data
  function structuredToMessage(): string {
    const lines: string[] = ["📊 Price Report"];
    if (editLocation) {
      lines.push(`📍 ${editLocation}`);
    }
    for (const item of editPriceItems) {
      if (item.vegetable && item.price) {
        lines.push(`${item.vegetable}: ${item.price} KHR/${item.unit || "kg"}`);
      }
    }
    if (editNotes) {
      lines.push(`📝 Notes: ${editNotes}`);
    }
    return lines.join("\n");
  }

  function updatePriceItem(index: number, field: keyof PriceItem, value: string) {
    setEditPriceItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addPriceItem() {
    setEditPriceItems((prev) => [...prev, { vegetable: "", price: "", unit: "kg" }]);
  }

  function removePriceItem(index: number) {
    setEditPriceItems((prev) => prev.filter((_, i) => i !== index));
  }

  function applyTemplate(template: MessageTemplate) {
    setSubject(template.subject);
    setMessage(template.message);
    setIncludePriceForm(template.includePriceForm);
    setSelectedTemplateId(template.id);
  }

  useEffect(() => {
    fetchFarmerLeads();
    fetchNotificationHistory();
    fetchFarmerResponses();
  }, []);

  async function fetchFarmerLeads() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications?action=get_farmer_leads");
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setFarmerLeads(json.farmers || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load farmer leads");
    } finally {
      setLoading(false);
    }
  }

  async function fetchNotificationHistory(page = 1) {
    setHistoryLoading(true);
    try {
      const offset = (page - 1) * HISTORY_PAGE_SIZE;
      const res = await fetch(`/api/notifications?action=get_history&limit=${HISTORY_PAGE_SIZE}&offset=${offset}`);
      const json = await res.json();
      setNotificationHistory(json.history || []);
      setHistoryTotal(json.total || 0);
      setHistoryPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function fetchFarmerResponses() {
    setResponsesLoading(true);
    try {
      const res = await fetch("/api/notifications/webhook?action=get_responses&limit=50");
      const json = await res.json();
      const responses = json.responses || [];
      setFarmerResponses(responses);
      setUnreadCount(responses.filter((r: FarmerResponse) => !r.is_read).length);
    } catch (err) {
      console.error(err);
    } finally {
      setResponsesLoading(false);
    }
  }

  async function markResponseAsRead(id: number) {
    try {
      await fetch(`/api/notifications/webhook?action=mark_read&id=${id}`);
      setFarmerResponses((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_read: true } : r))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications/webhook?action=mark_all_read");
      setFarmerResponses((prev) => prev.map((r) => ({ ...r, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  }

  async function approveResponse(id: number) {
    setApproving(id);
    try {
      await fetch(`/api/notifications/webhook?action=approve&id=${id}`);
      setFarmerResponses((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, approval_status: "approved" as const, is_read: true, approved_at: new Date().toISOString() } : r
        )
      );
      setSuccess("Response approved successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to approve response");
    } finally {
      setApproving(null);
    }
  }

  async function rejectResponse(id: number) {
    setApproving(id);
    try {
      await fetch(`/api/notifications/webhook?action=reject&id=${id}`);
      setFarmerResponses((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, approval_status: "rejected" as const, is_read: true, approved_at: new Date().toISOString() } : r
        )
      );
      setSuccess("Response rejected");
    } catch (err) {
      console.error(err);
      setError("Failed to reject response");
    } finally {
      setApproving(null);
    }
  }

  function openBroadcastModal(response: FarmerResponse) {
    setBroadcastingResponse(response);
    setBroadcastSelectedUsers(new Set());
    setBroadcastSelectAll(false);
    setBroadcastModalOpen(true);
    fetchAllUsers();
  }

  async function fetchAllUsers() {
    setAllUsersLoading(true);
    try {
      const res = await fetch("/api/notifications?action=get_all_users");
      const json = await res.json();
      setAllUsers(json.users || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setAllUsersLoading(false);
    }
  }

  function handleBroadcastSelectUser(userId: number) {
    const newSet = new Set(broadcastSelectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setBroadcastSelectedUsers(newSet);
    setBroadcastSelectAll(newSet.size === allUsers.length);
  }

  function handleBroadcastSelectAll() {
    if (broadcastSelectAll) {
      setBroadcastSelectedUsers(new Set());
      setBroadcastSelectAll(false);
    } else {
      setBroadcastSelectedUsers(new Set(allUsers.map((u) => u.user_id)));
      setBroadcastSelectAll(true);
    }
  }

  async function broadcastPrice() {
    if (!broadcastingResponse || broadcastSelectedUsers.size === 0) {
      setError("Please select at least one user to broadcast to");
      return;
    }

    setBroadcasting(true);
    setError(null);

    try {
      const priceMessage = broadcastingResponse.edited_message || broadcastingResponse.message;
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ids: Array.from(broadcastSelectedUsers),
          subject: "តម្លៃទីផ្សារថ្ងៃនេះ (Today's Market Prices)",
          message: `📢 តម្លៃទីផ្សារបានធ្វើបច្ចុប្បន្នភាព!\n\n${priceMessage}\n\n🕐 ${new Date().toLocaleString('km-KH')}`,
          include_price_form: false,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to broadcast prices");
      } else {
        setSuccess(`Successfully broadcasted prices to ${json.sent_count} user(s)`);
        setBroadcastModalOpen(false);
        setBroadcastingResponse(null);
        setBroadcastSelectedUsers(new Set());
        fetchNotificationHistory();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to broadcast prices");
    } finally {
      setBroadcasting(false);
    }
  }

  function openEditModal(response: FarmerResponse) {
    setEditingResponse(response);
    setEditedMessage(response.message);
    
    // Parse message into structured fields
    const parsed = parseMessageToStructured(response.message);
    setEditLocation(parsed.location);
    setEditPriceItems(parsed.items.length > 0 ? parsed.items : [{ vegetable: "", price: "", unit: "kg" }]);
    setEditNotes(parsed.notes);
    
    setEditModalOpen(true);
  }

  async function saveEditAndApprove() {
    if (!editingResponse) return;
    
    // Reconstruct the edited message from structured fields
    const finalMessage = structuredToMessage();
    
    setApproving(editingResponse.id);
    try {
      const params = new URLSearchParams({
        action: "edit_approve",
        id: editingResponse.id.toString(),
        edited_message: finalMessage,
      });
      await fetch(`/api/notifications/webhook?${params.toString()}`);
      
      const finalMessageForState = finalMessage;
      setFarmerResponses((prev) =>
        prev.map((r) =>
          r.id === editingResponse.id
            ? { ...r, edited_message: finalMessageForState, approval_status: "approved" as const, is_read: true, approved_at: new Date().toISOString() }
            : r
        )
      );
      setEditModalOpen(false);
      setEditingResponse(null);
      setEditLocation("");
      setEditPriceItems([]);
      setEditNotes("");
      setSuccess("Response edited and approved");
    } catch (err) {
      console.error(err);
      setError("Failed to save and approve");
    } finally {
      setApproving(null);
    }
  }

  async function sendNotification() {
    if (selectedUsers.size === 0) {
      setError("Please select at least one farmer lead");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ids: Array.from(selectedUsers),
          subject,
          message: message.trim(),
          include_price_form: includePriceForm,
        }),
      });

      const json = await res.json();
      
      if (!res.ok) {
        setError(json.error || "Failed to send notifications");
      } else {
        setSuccess(`Successfully sent notifications to ${json.sent_count} farmer lead(s)`);
        setMessage("");
        setSubject("");
        setSelectedUsers(new Set());
        setSelectAll(false);
        fetchNotificationHistory();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send notifications");
    } finally {
      setSending(false);
    }
  }

  function handleSelectUser(userId: number) {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
    setSelectAll(newSet.size === farmerLeads.length);
  }

  function handleSelectAll() {
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      setSelectedUsers(new Set(farmerLeads.map((f) => f.user_id)));
      setSelectAll(true);
    }
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notification Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Send price inquiries to farmer leads via Telegram</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchFarmerLeads(); fetchNotificationHistory(); fetchFarmerResponses(); }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "notifications"
                ? "bg-white text-emerald-600 border-t border-l border-r border-slate-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Send Notifications
            </span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "history"
                ? "bg-white text-emerald-600 border-t border-l border-r border-slate-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </span>
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "responses"
                ? "bg-white text-emerald-600 border-t border-l border-r border-slate-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Farmer Responses
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="p-6 pt-0 space-y-6">
        {/* Error/Success Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-emerald-700">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {activeTab === "notifications" && (
          <>
            <div className="grid grid-cols-2 gap-6">
              {/* Farmer Leads Selection */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Farmer Leads</h2>
                  <p className="text-sm text-slate-500">Select recipients for your notification</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                  {farmerLeads.length} total
                </span>
              </div>
            </div>

            <div className="p-4">
              {/* Select All */}
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="selectAll" className="text-sm font-medium text-slate-700">
                  Select All ({selectedUsers.size} selected)
                </label>
              </div>

              {/* Farmer List */}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : farmerLeads.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No farmer leads found
                  </div>
                ) : (
                  farmerLeads.map((farmer) => (
                    <div
                      key={farmer.user_id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedUsers.has(farmer.user_id)
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                      onClick={() => handleSelectUser(farmer.user_id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(farmer.user_id)}
                        onChange={() => handleSelectUser(farmer.user_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {farmer.user_id.toString().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">User #{farmer.user_id}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {farmer.location || "Unknown location"} | {farmer.gender || "N/A"} | {farmer.age_range || "N/A"}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                        </svg>
                        Telegram Ready
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Compose Message */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Compose Message</h2>
              <p className="text-sm text-slate-500">Use a template or write your notification message</p>
            </div>
            <div className="p-4 space-y-4">
              {/* Message templates */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quick templates</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const t = MESSAGE_TEMPLATES.find((x) => x.id === id);
                    if (t) applyTemplate(t);
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
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setSelectedTemplateId("custom");
                  }}
                  placeholder="Enter subject..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setSelectedTemplateId("custom");
                  }}
                  placeholder="Write your message here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{message.length} characters</p>
              </div>

              {/* Include Price Form Toggle */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <input
                  type="checkbox"
                  id="includePriceForm"
                  checked={includePriceForm}
                  onChange={(e) => setIncludePriceForm(e.target.checked)}
                  className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="includePriceForm" className="flex-1 cursor-pointer">
                  <span className="text-sm font-medium text-emerald-800">Include Price Input Form</span>
                  <p className="text-xs text-emerald-600">Adds a button for farmers to submit prices through an interactive form</p>
                </label>
              </div>

              <button
                onClick={sendNotification}
                disabled={sending || selectedUsers.size === 0 || !message.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                    Send via Telegram ({selectedUsers.size} recipients)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Notification History</h2>
                  <p className="text-sm text-slate-500">
                    Showing {notificationHistory.length} of {historyTotal} notifications (Page {historyPage} of {Math.ceil(historyTotal / HISTORY_PAGE_SIZE) || 1})
                  </p>
                </div>
                <button
                  onClick={() => fetchNotificationHistory(1)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : notificationHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No notifications sent yet
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent At</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {notificationHistory.map((notification) => (
                      <tr key={notification.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm text-slate-800">#{notification.user_id}</td>
                        <td className="px-5 py-4 text-sm text-slate-600 max-w-md truncate">{notification.message}</td>
                        <td className="px-5 py-4 text-sm text-slate-500">{formatDate(notification.sent_at)}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              notification.status === "sent"
                                ? "bg-emerald-100 text-emerald-700"
                                : notification.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {notification.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {historyTotal > HISTORY_PAGE_SIZE && (
              <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {historyPage} of {Math.ceil(historyTotal / HISTORY_PAGE_SIZE)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchNotificationHistory(historyPage - 1)}
                    disabled={historyPage <= 1 || historyLoading}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchNotificationHistory(historyPage + 1)}
                    disabled={historyPage >= Math.ceil(historyTotal / HISTORY_PAGE_SIZE) || historyLoading}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "responses" && (
          <>
            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{farmerResponses.length}</p>
                    <p className="text-xs text-slate-500">Total Responses</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">
                      {farmerResponses.filter(r => !r.approval_status || r.approval_status === "pending").length}
                    </p>
                    <p className="text-xs text-slate-500">Pending Review</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {farmerResponses.filter(r => r.approval_status === "approved").length}
                    </p>
                    <p className="text-xs text-slate-500">Approved</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {farmerResponses.filter(r => r.approval_status === "rejected").length}
                    </p>
                    <p className="text-xs text-slate-500">Rejected</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header Section */}
              <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Farmer Responses</h2>
                      <p className="text-sm text-slate-500">Review and approve price submissions from farmers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-red-200 animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        {unreadCount} New
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => fetchFarmerResponses()}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Responses List */}
              <div className="max-h-[calc(100vh-400px)] min-h-[400px] overflow-y-auto">
                {responsesLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-emerald-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">Loading responses...</p>
                  </div>
                ) : farmerResponses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="p-4 bg-slate-100 rounded-full mb-4">
                      <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">No responses yet</h3>
                    <p className="text-sm text-slate-500 mt-1 text-center max-w-sm">
                      Farmer responses will appear here when they submit price information via Telegram
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {farmerResponses.map((response) => (
                      <div
                        key={response.id}
                        className={`group relative bg-white border rounded-xl transition-all duration-200 hover:shadow-md ${
                          !response.is_read 
                            ? "border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200" 
                            : response.approval_status === "approved"
                            ? "border-emerald-200"
                            : response.approval_status === "rejected"
                            ? "border-red-200"
                            : "border-slate-200"
                        }`}
                      >
                        {/* Unread indicator */}
                        {!response.is_read && (
                          <div className="absolute -left-1 top-4 w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-300"></div>
                        )}
                        
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center text-white">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                                </svg>
                              </div>
                              {/* Status dot */}
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                response.approval_status === "approved"
                                  ? "bg-emerald-500"
                                  : response.approval_status === "rejected"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                              }`}></div>
                            </div>
                            
                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                              {/* Header Row */}
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-slate-800">
                                      {response.sender_name || `Farmer #${response.telegram_user_id}`}
                                    </h3>
                                    {/* Status Badge */}
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${
                                        response.approval_status === "approved"
                                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                          : response.approval_status === "rejected"
                                          ? "bg-red-100 text-red-700 border border-red-200"
                                          : "bg-amber-100 text-amber-700 border border-amber-200"
                                      }`}
                                    >
                                      {response.approval_status === "approved" ? (
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      ) : response.approval_status === "rejected" ? (
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      {response.approval_status === "approved" ? "Approved" : response.approval_status === "rejected" ? "Rejected" : "Pending"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Telegram ID: {response.telegram_user_id} • {formatDate(response.received_at)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Message Content */}
                              <div className={`rounded-xl p-4 ${
                                response.edited_message 
                                  ? "bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-100"
                                  : "bg-slate-50 border border-slate-100"
                              }`}>
                                {response.edited_message ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Edited by Admin
                                    </div>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">{response.edited_message}</p>
                                    <div className="pt-3 border-t border-slate-200">
                                      <p className="text-xs text-slate-400 mb-1">Original submission:</p>
                                      <p className="text-xs text-slate-400 italic line-through">{response.message}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">{response.message}</p>
                                )}
                              </div>
                              
                              {/* Action Footer */}
                              <div className="mt-4 flex items-center justify-between">
                                {response.approval_status === "pending" || !response.approval_status ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => approveResponse(response.id)}
                                      disabled={approving === response.id}
                                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 shadow-sm shadow-emerald-200 transition-all active:scale-95"
                                    >
                                      {approving === response.id ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => openEditModal(response)}
                                      disabled={approving === response.id}
                                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 border border-blue-200 transition-all active:scale-95"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Edit & Approve
                                    </button>
                                    <button
                                      onClick={() => rejectResponse(response.id)}
                                      disabled={approving === response.id}
                                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 border border-red-200 transition-all active:scale-95"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                                      response.approval_status === "approved" 
                                        ? "bg-emerald-50 text-emerald-700" 
                                        : "bg-red-50 text-red-700"
                                    }`}>
                                      {response.approval_status === "approved" ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      <span className="font-medium">
                                        {response.approval_status === "approved" ? "Approved" : "Rejected"}
                                      </span>
                                      {response.approved_at && (
                                        <span className="text-xs opacity-75">• {formatDate(response.approved_at)}</span>
                                      )}
                                    </div>
                                    {response.approval_status === "approved" && (
                                      <button
                                        onClick={() => openBroadcastModal(response)}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm shadow-blue-200 transition-all active:scale-95"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                        </svg>
                                        Broadcast
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Professional Edit Modal */}
            {editModalOpen && editingResponse && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                  onClick={() => { setEditModalOpen(false); setEditingResponse(null); }}
                ></div>
                
                {/* Modal Content */}
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">Edit Price Report</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                              </svg>
                              {editingResponse.sender_name || `Farmer #${editingResponse.telegram_user_id}`}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setEditModalOpen(false); setEditingResponse(null); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Modal Body */}
                  <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Original Submission */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 rounded-lg">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <label className="text-sm font-semibold text-slate-700">Original Submission</label>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit">
                          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{editingResponse.message}</p>
                        </div>
                      </div>
                      
                      {/* Right Column - Structured Edit Form */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <label className="text-sm font-semibold text-slate-700">Edit Fields</label>
                          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Click to edit</span>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Location Field */}
                          <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors group">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg">📍</span>
                              <label className="text-sm font-medium text-slate-700">Location</label>
                            </div>
                            <input
                              type="text"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              placeholder="Enter location..."
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                            />
                          </div>
                          
                          {/* Price Items Section */}
                          <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">💰</span>
                                <label className="text-sm font-medium text-slate-700">Vegetable Prices</label>
                              </div>
                              <button
                                type="button"
                                onClick={addPriceItem}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Item
                              </button>
                            </div>
                            
                            <div className="space-y-3">
                              {editPriceItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg group/item">
                                  <div className="flex-1 grid grid-cols-3 gap-2">
                                    <input
                                      type="text"
                                      value={item.vegetable}
                                      onChange={(e) => updatePriceItem(index, "vegetable", e.target.value)}
                                      placeholder="Vegetable"
                                      className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                    />
                                    <input
                                      type="text"
                                      value={item.price}
                                      onChange={(e) => updatePriceItem(index, "price", e.target.value)}
                                      placeholder="Price"
                                      className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                    />
                                    <select
                                      value={item.unit}
                                      onChange={(e) => updatePriceItem(index, "unit", e.target.value)}
                                      className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                                    >
                                      <option value="kg">KHR/kg</option>
                                      <option value="g">KHR/g</option>
                                      <option value="piece">KHR/piece</option>
                                      <option value="bundle">KHR/bundle</option>
                                    </select>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removePriceItem(index)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                              
                              {editPriceItems.length === 0 && (
                                <button
                                  type="button"
                                  onClick={addPriceItem}
                                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors text-sm"
                                >
                                  + Add vegetable price
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Notes Field */}
                          <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg">📝</span>
                              <label className="text-sm font-medium text-slate-700">Notes</label>
                              <span className="text-xs text-slate-400">(optional)</span>
                            </div>
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Additional notes..."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview Section */}
                    <div className="border-t border-slate-200 pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <label className="text-sm font-semibold text-slate-700">Final Preview</label>
                        <span className="text-xs text-blue-600 font-medium">This will be saved</span>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                          {structuredToMessage() || <span className="text-slate-400 italic">Fill in the fields above to generate the message</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Changes will be saved and the response will be marked as approved
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setEditModalOpen(false); setEditingResponse(null); }}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEditAndApprove}
                        disabled={approving === editingResponse.id || editPriceItems.every(i => !i.vegetable || !i.price)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                      >
                        {approving === editingResponse.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Save & Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Broadcast Price Modal */}
            {broadcastModalOpen && broadcastingResponse && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                  onClick={() => { setBroadcastModalOpen(false); setBroadcastingResponse(null); }}
                ></div>
                
                {/* Modal Content */}
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-800">Broadcast Price Update</h2>
                          <p className="text-sm text-slate-500">Send approved prices to all users</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setBroadcastModalOpen(false); setBroadcastingResponse(null); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Modal Body */}
                  <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                    {/* Price Preview */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Price to Broadcast</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {broadcastingResponse.edited_message || broadcastingResponse.message}
                        </p>
                      </div>
                    </div>

                    {/* User Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Select Recipients ({broadcastSelectedUsers.size} selected)
                      </label>
                      
                      {/* Select All */}
                      <div className="mb-3 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="broadcastSelectAll"
                          checked={broadcastSelectAll}
                          onChange={handleBroadcastSelectAll}
                          disabled={allUsers.length === 0}
                          className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <label htmlFor="broadcastSelectAll" className="text-sm font-medium text-blue-700 cursor-pointer">
                          Select All Users ({allUsers.length})
                        </label>
                      </div>

                      {/* User List */}
                      <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3">
                        {allUsersLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : allUsers.length === 0 ? (
                          <div className="text-center py-8 text-slate-500 text-sm">No users found</div>
                        ) : (
                          allUsers.map((user) => (
                            <label
                              key={user.user_id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                broadcastSelectedUsers.has(user.user_id)
                                  ? "bg-blue-50 border border-blue-200"
                                  : "bg-white border border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={broadcastSelectedUsers.has(user.user_id)}
                                onChange={() => handleBroadcastSelectUser(user.user_id)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-slate-700">User #{user.user_id}</span>
                                  {user.role && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      user.role === 'farmer_lead' 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {user.role === 'farmer_lead' ? 'Lead' : user.role}
                                    </span>
                                  )}
                                  {user.gender && (
                                    <span className="text-xs text-slate-400">• {user.gender}</span>
                                  )}
                                </div>
                                {user.location && (
                                  <p className="text-xs text-slate-500 truncate">{user.location}</p>
                                )}
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Price update will be sent to {broadcastSelectedUsers.size} user(s)
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setBroadcastModalOpen(false); setBroadcastingResponse(null); }}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={broadcastPrice}
                        disabled={broadcasting || broadcastSelectedUsers.size === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all active:scale-95"
                      >
                        {broadcasting ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                        Send Broadcast
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
