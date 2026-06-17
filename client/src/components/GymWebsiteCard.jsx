import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { FiCopy, FiDownload, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";

export function GymWebsiteCard({ gym }) {
  const [qr, setQr] = useState("");
  const websiteUrl = useMemo(() => {
    if (!gym?.slug) return "";
    return `${window.location.origin}/gym/${gym.slug}`;
  }, [gym?.slug]);

  useEffect(() => {
    if (!websiteUrl) return;
    QRCode.toDataURL(websiteUrl, { width: 320, margin: 2 }).then(setQr);
  }, [websiteUrl]);

  async function copyLink() {
    await navigator.clipboard.writeText(websiteUrl);
  }

  function downloadQr() {
    const link = document.createElement("a");
    link.href = qr;
    link.download = `${gym.slug}-qr-code.png`;
    link.click();
  }

  if (!websiteUrl) return null;

  return (
    <div className="surface p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Public Gym Website</h2>
          <p className="mt-2 break-all text-sm font-medium text-brand-600">{websiteUrl}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn-primary" to={`/gym/${gym.slug}`} target="_blank"><FiExternalLink /> Open Website</Link>
            <button className="btn-secondary" type="button" onClick={copyLink}><FiCopy /> Copy Link</button>
            <button className="btn-secondary" type="button" onClick={downloadQr} disabled={!qr}><FiDownload /> Download QR</button>
          </div>
        </div>
        {qr && <img className="h-36 w-36 rounded-md border border-slate-200 bg-white p-2" src={qr} alt={`${gym.name} QR code`} />}
      </div>
    </div>
  );
}
