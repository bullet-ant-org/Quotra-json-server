import { useEffect } from "react";

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Outsider` : "Outsider | Go out more";
  }, [title]);
}
