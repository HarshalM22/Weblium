import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

export function useWebContainer() {
  const [webcontainer, setWebContainer] = useState<WebContainer | null>(null);

  useEffect(() => {
    (async () => {
      const instance = await WebContainer.boot();
      setWebContainer(instance);
    })();
  }, []);

  return webcontainer;
}
