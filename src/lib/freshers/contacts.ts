export const FRESHER_CONTACT_SETTINGS_ID = "default";

export const DEFAULT_FRESHER_CONTACTS = {
  presidentPhone: "09131644974",
  executiveSupportPhone: "09157294525",
  staffAdviserPhone: "",
};

export function formatPhoneForWhatsApp(phone: string) {
  return phone.replace(/\D/g, "");
}
