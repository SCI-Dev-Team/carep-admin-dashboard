export type FarmerLead = {
  user_id: number;
  gender?: string;
  age_range?: string;
  location?: string;
  created_at?: string;
  telegram_chat_id?: string;
  telegram_name?: string;
};

export type User = {
  user_id: number;
  gender?: string;
  age_range?: string;
  location?: string;
  role?: string;
  created_at?: string;
  telegram_chat_id?: string;
  telegram_name?: string;
};

export type NotificationHistory = {
  id: number;
  user_id: number;
  message: string;
  sent_at: string;
  status: string;
};

export type FarmerResponse = {
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
  /** True when response has an image (webapp upload or legacy Telegram photo) */
  has_image?: boolean;
  /** URL when image was stored on GCP (price-images folder) */
  image_url?: string | null;
}

export type MessageTemplate = {
  id: string;
  label: string;
  subject: string;
  message: string;
  includePriceForm: boolean;
};

export type PriceItem = { vegetable: string; price: string; unit: string };

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "ask_prices",
    label: "សុំតម្លៃថ្ងៃនេះ – សាឡាត ត្រសក់ ខាប់ផ្កាយ... (Ask today's prices)",
    subject: "សុំតម្លៃអាហារបន្លៃ",
    message: "សួស្តី! យើងចង់សុំតម្លៃអាហារបន្លៃថ្ងៃនេះពីអ្នក។ សូមចុចប៊ូតុងខាងក្រោម រួមតាមនោះអ្នកអាចផ្ញើរូបថតតម្លៃ ឬបញ្ចូលតម្លៃដោយដៃ។ សូមអរគុណ!",
    includePriceForm: true,
  },
  {
    id: "custom",
    label: "សរសេរខ្លួនឯង (Write your own)",
    subject: "",
    message: "",
    includePriceForm: true,
  },
];
