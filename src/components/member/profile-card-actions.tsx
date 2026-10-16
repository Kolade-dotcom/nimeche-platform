"use client";

import * as React from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { CheckIcon, QrCodeIcon, SmartphoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProfileCardActions({
  fullName,
  email,
  department,
  memberNumber,
  profilePath,
}: {
  fullName: string;
  email: string;
  department: string | null;
  memberNumber: string | null;
  profilePath: string | null;
}) {
  const [qrOpen, setQrOpen] = React.useState(false);
  const [qrData, setQrData] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const profileUrl = profilePath ? new URL(profilePath, typeof window === "undefined" ? "http://localhost" : window.location.origin).toString() : null;

  React.useEffect(() => {
    let cancelled = false;
    if (!qrOpen || !profileUrl) {
      return;
    }
    QRCode.toDataURL(profileUrl, { width: 280, margin: 1, color: { dark: "#123b2a", light: "#ffffff" } })
      .then((url) => { if (!cancelled) setQrData(url); })
      .catch(() => { if (!cancelled) setQrData(null); });
    return () => { cancelled = true; };
  }, [qrOpen, profileUrl]);

  function saveToPhone() {
    const safeName = fullName.replace(/[\\,;]/g, " ");
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${escapeVCard(safeName)}`,
      `N:${escapeVCard(safeName)};;;;`,
      `EMAIL;TYPE=INTERNET:${escapeVCard(email)}`,
      ...(department ? [`ORG:NiMechE-SF;${escapeVCard(department)}`] : ["ORG:NiMechE-SF"]),
      ...(memberNumber ? [`NOTE:Member number ${escapeVCard(memberNumber)}`] : []),
      ...(profileUrl ? [`URL:${profileUrl}`] : []),
      "END:VCARD",
    ];
    const file = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "member"}.vcf`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyProfileLink() {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
    } catch {
      const input = document.createElement("input");
      input.value = profileUrl;
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={saveToPhone}>
        <SmartphoneIcon /> Save to phone
      </Button>
      <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
        <QrCodeIcon /> Show QR
      </Button>
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Member profile QR code</DialogTitle>
            <DialogDescription>
              Scan this code to open your public profile. Your matric number and email are not shown there.
            </DialogDescription>
          </DialogHeader>
          {profileUrl ? (
            <div className="flex flex-col items-center gap-4">
              {qrData ? <Image src={qrData} alt="QR code for your public profile" width={256} height={256} unoptimized className="size-64 rounded-md border bg-white p-2" /> : <div className="bg-muted size-64 animate-pulse rounded-md" aria-label="Generating QR code" />}
              <Button variant="outline" size="sm" onClick={() => void copyProfileLink()}>
                {copied ? <CheckIcon /> : null}{copied ? "Link copied" : "Copy profile link"}
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground rounded-md border p-4 text-sm">
              Turn on your public profile first to create a shareable QR code.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function escapeVCard(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
