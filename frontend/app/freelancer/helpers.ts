export type EscrowStatus =
  | "Created"
  | "Funded"
  | "Released"
  | "Refunded"
  | "Disputed"
  | "Resolved"
  | "Cancelled";

export interface EscrowItem {
  id: string;
  client: string;
  freelancer: string;
  arbiter: string;
  tokenSymbol: string;
  amount: number;
  deadline: string;
  status: EscrowStatus;
  createdAt: string;
}

export function getStatusBadgeStyle(status: EscrowStatus): Record<string, string> {
  switch (status) {
    case "Funded":
      return { backgroundColor: "#dbeafe", color: "#1e40af", borderColor: "#bfdbfe" };
    case "Released":
    case "Resolved":
      return { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" };
    case "Disputed":
      return { backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#fde68a" };
    case "Refunded":
    case "Cancelled":
      return { backgroundColor: "#f1f5f9", color: "#475569", borderColor: "#e2e8f0" };
    case "Created":
    default:
      return { backgroundColor: "#f3e8ff", color: "#6b21a8", borderColor: "#e9d5ff" };
  }
}

export function truncateAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr || "";
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}
