// src/app/payments/[id]/receipt/PrintButton.tsx
"use client";

import { buttonPrimaryClass } from "@/lib/styles";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className={buttonPrimaryClass}>
      Imprimir comprobante
    </button>
  );
}