"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

export function SearchInput({
  placeholder = "Search…",
  paramName = "search",
}: {
  placeholder?: string;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(searchParams.get(paramName) ?? "");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function update(next: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set(paramName, next);
      } else {
        params.delete(paramName);
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
  }

  return (
    <div className="relative">
      <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          update(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (timerRef.current) clearTimeout(timerRef.current);
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
              params.set(paramName, value);
            } else {
              params.delete(paramName);
            }
            router.push(`${pathname}?${params.toString()}`);
          }
        }}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}
