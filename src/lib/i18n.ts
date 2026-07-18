"use client";

import { useState } from "react";

export type Lang = "th" | "en";

const LANG_KEY = "wpf_lang";

export const dict = {
  th: {
    appTitle: "ค้นหากล่องสินค้า",
    uploadBtn: "+ อัพโหลด",
    searchPlaceholder: "รหัส 4 ตัวท้าย",
    searching: "กำลังค้นหา...",
    notFound: "ไม่พบรหัสสินค้า ติดต่อผู้ดูแล",
    back: "กลับ",
    resultsTitle: (code: string, count: number) => `รหัส ${code} — ${count} รูป`,
    deleteCode: "ลบรหัสนี้ทั้งหมด",
    deletingCode: "กำลังลบ...",
    confirmDeleteCode: (code: string, count: number) =>
      `ลบรูปทั้งหมด ${count} รูปของรหัส ${code}? ย้อนกลับไม่ได้`,
    recentTitle: "อัพโหลดล่าสุด",
    photosCount: (n: number) => `${n} รูป`,
    deletePhoto: "ลบรูปนี้",
    deletingPhoto: "กำลังลบ...",
    confirmDeletePhoto: "ลบรูปนี้?",
    searchBack: "ค้นหา",
    uploadTitle: "อัพโหลดรูป",
    codeLabel: "รหัสสินค้า (4 หลัก)",
    codePlaceholder: "เช่น 1234",
    errorEnterCode: "กรอกรหัส 4 หลักก่อนเลือกรูป",
    takePhoto: "ถ่ายรูป",
    takePhotoAgain: "ถ่ายรูปต่อ",
    chooseFromLibrary: "เลือกจากคลังภาพ",
    statusCompressing: "กำลังย่อ...",
    statusUploading: "กำลังอัพ...",
    statusDone: "สำเร็จ",
    statusError: "ผิดพลาด",
    nextCode: "อัพรหัสถัดไป",
    loginTitle: "คลังสินค้า",
    loginSubtitle: "กรอกรหัสผ่านเพื่อเข้าใช้งาน",
    passwordPlaceholder: "รหัสผ่าน",
    loggingIn: "กำลังเข้าสู่ระบบ...",
    loginBtn: "เข้าสู่ระบบ",
    loginFailed: "เข้าสู่ระบบไม่สำเร็จ",
  },
  en: {
    appTitle: "Find Product Box",
    uploadBtn: "+ Upload",
    searchPlaceholder: "Last 4 digits",
    searching: "Searching...",
    notFound: "Code not found. Contact admin.",
    back: "Back",
    resultsTitle: (code: string, count: number) => `Code ${code} — ${count} photo(s)`,
    deleteCode: "Delete this code entirely",
    deletingCode: "Deleting...",
    confirmDeleteCode: (code: string, count: number) =>
      `Delete all ${count} photo(s) for code ${code}? This can't be undone.`,
    recentTitle: "Recent uploads",
    photosCount: (n: number) => `${n} photos`,
    deletePhoto: "Delete this photo",
    deletingPhoto: "Deleting...",
    confirmDeletePhoto: "Delete this photo?",
    searchBack: "Search",
    uploadTitle: "Upload photos",
    codeLabel: "Product code (4 digits)",
    codePlaceholder: "e.g. 1234",
    errorEnterCode: "Enter a 4-digit code before picking photos",
    takePhoto: "Take photo",
    takePhotoAgain: "Take another",
    chooseFromLibrary: "Choose from library",
    statusCompressing: "Compressing...",
    statusUploading: "Uploading...",
    statusDone: "Done",
    statusError: "Error",
    nextCode: "Next code",
    loginTitle: "Warehouse",
    loginSubtitle: "Enter password to continue",
    passwordPlaceholder: "Password",
    loggingIn: "Signing in...",
    loginBtn: "Sign in",
    loginFailed: "Sign in failed",
  },
} as const;

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "th";
  const saved = window.localStorage.getItem(LANG_KEY);
  return saved === "en" || saved === "th" ? saved : "th";
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem(LANG_KEY, next);
  }

  return { lang, setLang, t: dict[lang] };
}
