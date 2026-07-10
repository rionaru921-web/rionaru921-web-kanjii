"use client";

import { useState, type ReactNode } from "react";
import CreatePlanModal from "./CreatePlanModal";

interface CreatePlanButtonProps {
  children: ReactNode;
  className?: string;
}

export default function CreatePlanButton({ children, className = "" }: CreatePlanButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <CreatePlanModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
