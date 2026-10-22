import { useNavigate, useParams } from "react-router-dom";
import { ScanSheet } from "../../components/ScanSheet";
import { FeedSkeleton } from "../../components/FeedSkeleton";

// Opened by a phone's normal camera scanning a business QR (https://<site>/checkin/<place>).
export function CheckinLink() {
  const { slug = "" } = useParams();
  const nav = useNavigate();
  return <><FeedSkeleton /><ScanSheet initial={slug} onClose={() => nav("/wallet", { replace: true })} /></>;
}
