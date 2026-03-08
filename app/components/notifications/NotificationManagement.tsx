"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { FarmerLead, User, NotificationHistory, FarmerResponse, MessageTemplate, PriceItem } from "./types";
import { parseMessageToStructured, structuredToMessage } from "./messageUtils";
import RecipientSelector from "./RecipientSelector";
import ComposeMessage from "./ComposeMessage";
import NotificationHistoryTab from "./NotificationHistoryTab";
import FarmerResponsesTab from "./FarmerResponsesTab";
import EditResponseModal from "./EditResponseModal";
import BroadcastModal from "./BroadcastModal";

const HISTORY_PAGE_SIZE = 20;

export default function NotificationManagement({ onClose }: { onClose: () => void }) {
  const [farmerLeads, setFarmerLeads] = useState<FarmerLead[]>([]);
  const [allUsersList, setAllUsersList] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [allUsersListLoading, setAllUsersListLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [farmerResponses, setFarmerResponses] = useState<FarmerResponse[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [includePriceForm, setIncludePriceForm] = useState(true);
  const [includeVoice, setIncludeVoice] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("custom");
  const [activeTab, setActiveTab] = useState<"notifications" | "history" | "responses">("notifications");
  const [userSelectionTab, setUserSelectionTab] = useState<"farmer_leads" | "all_users">("farmer_leads");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<FarmerResponse | null>(null);
  const [approving, setApproving] = useState<number | null>(null);
  const [editLocation, setEditLocation] = useState("");
  const [editPriceItems, setEditPriceItems] = useState<PriceItem[]>([]);
  const [editNotes, setEditNotes] = useState("");

  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastingResponse, setBroadcastingResponse] = useState<FarmerResponse | null>(null);
  const [broadcastSelectedUsers, setBroadcastSelectedUsers] = useState<Set<number>>(new Set());
  const [broadcastSelectAll, setBroadcastSelectAll] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allUsersLoading, setAllUsersLoading] = useState(false);

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
    try {
      const res = await fetch("/api/notifications?action=get_farmer_leads");
      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
      } else {
        setFarmerLeads(json.farmers || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load farmer leads");
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
      toast.success("Response approved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve response");
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
      toast.success("Response rejected");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject response");
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
      toast.error("Failed to load users");
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
      toast.error("Please select at least one user to broadcast to");
      return;
    }

    setBroadcasting(true);

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
        toast.error(json.error || "Failed to broadcast prices");
      } else {
        toast.success(`Successfully broadcasted prices to ${json.sent_count} user(s)`);
        setBroadcastModalOpen(false);
        setBroadcastingResponse(null);
        setBroadcastSelectedUsers(new Set());
        fetchNotificationHistory();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to broadcast prices");
    } finally {
      setBroadcasting(false);
    }
  }

  function openEditModal(response: FarmerResponse) {
    setEditingResponse(response);
    const parsed = parseMessageToStructured(response.message);
    setEditLocation(parsed.location);
    setEditPriceItems(parsed.items.length > 0 ? parsed.items : [{ vegetable: "", price: "", unit: "kg" }]);
    setEditNotes(parsed.notes);
    
    setEditModalOpen(true);
  }

  async function saveEditAndApprove() {
    if (!editingResponse) return;
    const finalMessage = structuredToMessage(editLocation, editPriceItems, editNotes);
    
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
      toast.success("Response edited and approved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save and approve");
    } finally {
      setApproving(null);
    }
  }

  async function sendNotification() {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one farmer lead");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ids: Array.from(selectedUsers),
          subject,
          message: message.trim(),
          include_price_form: includePriceForm,
          include_voice: includeVoice,
        }),
      });

      const json = await res.json();
      
      if (!res.ok) {
        toast.error(json.error || "Failed to send notifications");
      } else {
        toast.success(`Successfully sent notifications to ${json.sent_count} farmer lead(s)`);
        setMessage("");
        setSubject("");
        setSelectedUsers(new Set());
        setSelectAll(false);
        fetchNotificationHistory();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send notifications");
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
    const currentList = userSelectionTab === "farmer_leads" ? farmerLeads : allUsersList;
    setSelectAll(newSet.size === currentList.length);
  }

  function handleSelectAll() {
    const currentList = userSelectionTab === "farmer_leads" ? farmerLeads : allUsersList;
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      setSelectedUsers(new Set(currentList.map((u) => u.user_id)));
      setSelectAll(true);
    }
  }

  function handleUserSelectionTabChange(tab: "farmer_leads" | "all_users") {
    setUserSelectionTab(tab);
    setSelectedUsers(new Set());
    setSelectAll(false);
    if (tab === "all_users" && allUsersList.length === 0) {
      fetchAllUsersList();
    }
  }

  async function fetchAllUsersList() {
    setAllUsersListLoading(true);
    try {
      const res = await fetch("/api/notifications?action=get_all_users");
      const json = await res.json();
      setAllUsersList(json.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAllUsersListLoading(false);
    }
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

      <div className="p-6 pt-0 space-y-6 mt-10">
        {/* Error/Success Alerts */}
        {activeTab === "notifications" && (
          <div className="grid grid-cols-2 gap-6">
            <RecipientSelector
              tab={userSelectionTab}
              onTabChange={handleUserSelectionTabChange}
              farmerLeads={farmerLeads}
              allUsersList={allUsersList}
              farmerLeadsLoading={loading}
              allUsersListLoading={allUsersListLoading}
              selectedUsers={selectedUsers}
              selectAll={selectAll}
              onSelectUser={handleSelectUser}
              onSelectAll={handleSelectAll}
            />
            <ComposeMessage
              subject={subject}
              message={message}
              includePriceForm={includePriceForm}
              includeVoice={includeVoice}
              selectedTemplateId={selectedTemplateId}
              sending={sending}
              selectedCount={selectedUsers.size}
              onSubjectChange={(v) => { setSubject(v); setSelectedTemplateId("custom"); }}
              onMessageChange={(v) => { setMessage(v); setSelectedTemplateId("custom"); }}
              onIncludePriceFormChange={setIncludePriceForm}
              onIncludeVoiceChange={setIncludeVoice}
              onTemplateSelect={applyTemplate}
              onSend={sendNotification}
            />
          </div>
        )}

        {activeTab === "history" && (
          <NotificationHistoryTab
            history={notificationHistory}
            loading={historyLoading}
            total={historyTotal}
            page={historyPage}
            pageSize={HISTORY_PAGE_SIZE}
            onPageChange={fetchNotificationHistory}
            onRefresh={() => fetchNotificationHistory(1)}
          />
        )}

        {activeTab === "responses" && (
          <>
            <FarmerResponsesTab
              responses={farmerResponses}
              loading={responsesLoading}
              unreadCount={unreadCount}
              approving={approving}
              onMarkAllRead={markAllAsRead}
              onRefresh={fetchFarmerResponses}
              onApprove={approveResponse}
              onReject={rejectResponse}
              onEditApprove={openEditModal}
              onBroadcast={openBroadcastModal}
            />
            <EditResponseModal
              open={editModalOpen}
              response={editingResponse}
              editLocation={editLocation}
              editPriceItems={editPriceItems}
              editNotes={editNotes}
              approving={approving}
              onClose={() => { setEditModalOpen(false); setEditingResponse(null); setEditLocation(""); setEditPriceItems([]); setEditNotes(""); }}
              onLocationChange={setEditLocation}
              onNotesChange={setEditNotes}
              updatePriceItem={updatePriceItem}
              addPriceItem={addPriceItem}
              removePriceItem={removePriceItem}
              onSaveApprove={saveEditAndApprove}
            />
            <BroadcastModal
              open={broadcastModalOpen}
              response={broadcastingResponse}
              users={allUsers}
              usersLoading={allUsersLoading}
              selectedUserIds={broadcastSelectedUsers}
              selectAll={broadcastSelectAll}
              broadcasting={broadcasting}
              onClose={() => { setBroadcastModalOpen(false); setBroadcastingResponse(null); }}
              onSelectUser={handleBroadcastSelectUser}
              onSelectAll={handleBroadcastSelectAll}
              onSend={broadcastPrice}
            />
          </>
        )}
      </div>
    </div>
  );
}
