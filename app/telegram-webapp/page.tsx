"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        close: () => void;
        expand: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
          start_param?: string;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        sendData: (data: string) => void;
        colorScheme: "light" | "dark";
      };
    };
  }
}

type VegetablePrice = {
  name: string;
  price: string;
  unit: string;
};

const VEGETABLES = [
  { name: "Cauliflower", nameKh: "ផ្កាខាត់ណា" },
  { name: "Cabbage", nameKh: "ស្ពៃក្តោប" },
  { name: "Tomato", nameKh: "ប៉េងប៉ោះ" },
  { name: "Cucumber", nameKh: "ត្រសក់" },
  { name: "Carrot", nameKh: "ការ៉ុត" },
  { name: "Onion", nameKh: "ខ្ទឹមបារាំង" },
  { name: "Garlic", nameKh: "ខ្ទឹមស" },
  { name: "Chili", nameKh: "ម្ទេស" },
];

const UNITS = [
  { value: "kg", label: "ក្នុង១គីឡូ" },
  { value: "bundle", label: "ក្នុង១ចង្កា" },
  { value: "piece", label: "ក្នុង១ដុំ" },
];

// Cambodia provinces (Khmer)
const PROVINCES = [
  { value: "", label: "ជ្រើសរើសខេត្ត/ក្រុង" },
  { value: "ភ្នំពេញ", label: "ភ្នំពេញ" },
  { value: "បន្ទាយមានជ័យ", label: "បន្ទាយមានជ័យ" },
  { value: "បាត់ដំបង", label: "បាត់ដំបង" },
  { value: "កំពង់ចាម", label: "កំពង់ចាម" },
  { value: "កំពង់ឆ្នាំង", label: "កំពង់ឆ្នាំង" },
  { value: "កំពង់ស្ពឺ", label: "កំពង់ស្ពឺ" },
  { value: "កំពង់ធំ", label: "កំពង់ធំ" },
  { value: "កំពត", label: "កំពត" },
  { value: "កណ្តាល", label: "កណ្តាល" },
  { value: "កោះកុង", label: "កោះកុង" },
  { value: "ក្រចេះ", label: "ក្រចេះ" },
  { value: "មណ្ឌលគិរី", label: "មណ្ឌលគិរី" },
  { value: "ឧត្តរមានជ័យ", label: "ឧត្តរមានជ័យ" },
  { value: "ប៉ៃលិន", label: "ប៉ៃលិន" },
  { value: "ព្រះសីហនុ", label: "ព្រះសីហនុ" },
  { value: "ព្រះវិហារ", label: "ព្រះវិហារ" },
  { value: "ពោធិ៍សាត់", label: "ពោធិ៍សាត់" },
  { value: "ព្រៃវែង", label: "ព្រៃវែង" },
  { value: "រតនគិរី", label: "រតនគិរី" },
  { value: "សៀមរាប", label: "សៀមរាប" },
  { value: "ស្ទឹងត្រែង", label: "ស្ទឹងត្រែង" },
  { value: "ស្វាយរៀង", label: "ស្វាយរៀង" },
  { value: "តាកែវ", label: "តាកែវ" },
  { value: "ត្បូងឃ្មុំ", label: "ត្បូងឃ្មុំ" },
  { value: "កែប", label: "កែប" },
];

export default function TelegramWebApp() {
  const [prices, setPrices] = useState<VegetablePrice[]>([]);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [telegramUser, setTelegramUser] = useState<{ id: number; name: string } | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window === 'undefined') return;
    
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setIsTelegramWebApp(true);
      tg.ready();
      tg.expand();

      // Get user info
      if (tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        setTelegramUser({
          id: user.id,
          name: [user.first_name, user.last_name].filter(Boolean).join(" "),
        });
      }

      // Set theme
      setIsDark(tg.colorScheme === "dark");

      // Setup main button (Khmer)
      tg.MainButton.text = "ដាក់ស្នើតម្លៃ";
      tg.MainButton.color = "#10b981";
      tg.MainButton.textColor = "#ffffff";
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Show/hide main button based on whether there are prices
    if (prices.length > 0) {
      tg.MainButton.show();
      tg.MainButton.enable();
    } else {
      tg.MainButton.hide();
    }

    const handleSubmit = () => submitPrices();
    tg.MainButton.onClick(handleSubmit);

    return () => {
      tg.MainButton.offClick(handleSubmit);
    };
  }, [prices, location, notes]);

  function addVegetable(vegName: string) {
    if (prices.find((p) => p.name === vegName)) return;
    setPrices([...prices, { name: vegName, price: "", unit: "kg" }]);
  }

  function removeVegetable(vegName: string) {
    setPrices(prices.filter((p) => p.name !== vegName));
  }

  function updatePrice(vegName: string, field: "price" | "unit", value: string) {
    setPrices(
      prices.map((p) => (p.name === vegName ? { ...p, [field]: value } : p))
    );
  }

  async function submitPrices() {
    const validPrices = prices.filter((p) => p.price.trim() !== "");
    if (validPrices.length === 0) {
      toast.error("សូមបញ្ចូលតម្លៃយ៉ាងតិចមួយ");
      return;
    }

    setIsSubmitting(true);

    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.MainButton.showProgress();
    }

    try {
      const response = await fetch("/api/notifications/webapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_user_id: telegramUser?.id,
          telegram_user_name: telegramUser?.name,
          location,
          notes,
          prices: validPrices,
          init_data: window.Telegram?.WebApp?.initData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ដាក់ស្នើមិនបានជោគជ័យ");
      }

      setSubmitted(true);

      // Close the WebApp after a short delay
      setTimeout(() => {
        if (tg) {
          tg.close();
        }
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ដាក់ស្នើតម្លៃមិនបានជោគជ័យ");
    } finally {
      setIsSubmitting(false);
      if (tg) {
        tg.MainButton.hideProgress();
      }
    }
  }

  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";
  const cardColor = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-gray-400" : "text-gray-500";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const inputBg = isDark ? "bg-gray-700" : "bg-white";

  if (submitted) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
        <div className={`${cardColor} rounded-2xl p-8 text-center shadow-lg max-w-sm w-full`}>
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className={`text-xl font-bold ${textColor} mb-2`}>អរគុណ!</h2>
          <p className={textMuted}>របាយការណ៍តម្លៃរបស់អ្នកត្រូវបានដាក់ស្នើជោគជ័យហើយ។</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} pb-24`}>
      {/* Header */}
      <div className={`${cardColor} border-b ${borderColor} px-4 py-4 sticky top-0 z-10`}>
        <h1 className={`text-lg font-bold ${textColor}`}>ដាក់ស្នើតម្លៃអាហារបន្លៃ</h1>
        <p className={`text-sm ${textMuted}`}>
          {telegramUser ? `សួស្តី ${telegramUser.name}!` : "ចែករំលែកតម្លៃផ្សារថ្ងៃនេះ"}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Province / Location */}
        <div className={`${cardColor} rounded-xl p-4 border ${borderColor}`}>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            ខេត្ត / ក្រុង
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={`w-full px-3 py-2.5 ${inputBg} border ${borderColor} rounded-lg text-sm ${textColor}`}
          >
            {PROVINCES.map((p) => (
              <option key={p.value || "empty"} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Select Vegetables */}
        <div className={`${cardColor} rounded-xl p-4 border ${borderColor}`}>
          <label className={`block text-sm font-medium ${textColor} mb-3`}>
            ជ្រើសរើសអាហារបន្លៃដើម្បីដាក់ស្នើតម្លៃ
          </label>
          <div className="flex flex-wrap gap-2">
            {VEGETABLES.map((veg) => {
              const isSelected = prices.some((p) => p.name === veg.name);
              return (
                <button
                  key={veg.name}
                  onClick={() => (isSelected ? removeVegetable(veg.name) : addVegetable(veg.name))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-white"
                      : isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {veg.nameKh}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Inputs */}
        {prices.length > 0 && (
          <div className={`${cardColor} rounded-xl p-4 border ${borderColor}`}>
            <label className={`block text-sm font-medium ${textColor} mb-3`}>
              បញ្ចូលតម្លៃ (រៀល)
            </label>
            <div className="space-y-3">
              {prices.map((item) => {
                const veg = VEGETABLES.find((v) => v.name === item.name);
                const displayName = veg ? veg.nameKh : item.name;
                return (
                <div key={item.name} className={`flex items-center gap-2 p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${textColor}`}>{displayName}</p>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updatePrice(item.name, "price", e.target.value)}
                        placeholder="តម្លៃ"
                        className={`flex-1 px-3 py-2 ${inputBg} border ${borderColor} rounded-lg text-sm ${textColor}`}
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updatePrice(item.name, "unit", e.target.value)}
                        className={`px-2 py-2 ${inputBg} border ${borderColor} rounded-lg text-sm ${textColor}`}
                      >
                        {UNITS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => removeVegetable(item.name)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className={`${cardColor} rounded-xl p-4 border ${borderColor}`}>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            កំណត់សម្គាល់ (ជម្រើស)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ព័ត៌មានបន្ថែមអំពីស្ថានភាពផ្សារ..."
            rows={3}
            className={`w-full px-3 py-2.5 ${inputBg} border ${borderColor} rounded-lg text-sm ${textColor} placeholder:${textMuted} resize-none`}
          />
        </div>

        {/* Non-Telegram Submit Button (fallback) */}
        {!isTelegramWebApp && prices.length > 0 && (
          <button
            onClick={submitPrices}
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "កំពុងដាក់ស្នើ..." : "ដាក់ស្នើតម្លៃ"}
          </button>
        )}
      </div>
    </div>
  );
}
