// src/app/dashboard/owner/contracts/[id]/MarkPaidButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markPaymentAsPaid, undoPayment } from "@/app/actions/payments";
import { useToast } from "@/components/Toast";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/lib/styles";

export function MarkPaidButton({ paymentId, isPaid }: { paymentId: string; isPaid: boolean }) {
  const router = useRouter();
  const showToast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const action = isPaid ? undoPayment(paymentId) : markPaymentAsPaid(paymentId);
    const result = await action;
    if (result.error) {
      showToast(result.error, "error");
      setLoading(false);
      return;
    }
    showToast(isPaid ? "Pago revertido" : "Pago registrado correctamente");
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={isPaid ? buttonSecondaryClass : buttonPrimaryClass}
    >
      {loading ? "..." : isPaid ? "Deshacer" : "Marcar pagado"}
    </button>
  );
}