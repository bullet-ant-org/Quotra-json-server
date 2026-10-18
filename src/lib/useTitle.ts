import { useEffect } from "react";

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Roamly` : "Roamly | Discover places worth experiencing";
  }, [title]);
}
