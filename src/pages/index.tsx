import Editor, { type Monaco } from "@monaco-editor/react";
import { useKeyPress, useRequest } from "ahooks";
import { useCallback, useMemo, useState } from "react";
import { request } from "../api";

function defineCheerfulTheme(monaco: Monaco) {
  monaco.editor.defineTheme("cheerful-json", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "string.key.json", foreground: "0d9488" },
      { token: "string.value.json", foreground: "0284c7" },
      { token: "number", foreground: "db2777" },
      { token: "keyword.json", foreground: "7c3aed" },
    ],
    colors: {
      "editor.background": "#fffefb",
      "editor.foreground": "#1e293b",
      "editorLineNumber.foreground": "#94a3b8",
      "editorLineNumber.activeForeground": "#64748b",
      "editorCursor.foreground": "#0ea5e9",
      "editor.selectionBackground": "#bae6fd66",
      "editor.inactiveSelectionBackground": "#e0f2fe99",
      "editorWhitespace.foreground": "#cbd5e1",
      "scrollbarSlider.background": "#cbd5e180",
      "scrollbarSlider.hoverBackground": "#94a3b8aa",
      "scrollbarSlider.activeBackground": "#64748baa",
    },
  });
}

function IconSave() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 21v-8H7v8M7 3v5h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Index() {
  const [value, setValue] = useState("");

  const {
    data: latestValue,
    loading,
    refreshAsync,
  } = useRequest(
    () => {
      return request({ url: "/routers/document/read" }).then((data) =>
        JSON.stringify(data, null, 2)
      );
    },
    {
      onSuccess(d) {
        setValue(d);
      },
    }
  );

  const couldSave = useMemo(() => {
    return latestValue !== value;
  }, [latestValue, value]);

  const { runAsync: onSave, loading: saving } = useRequest(
    async () => {
      if (!couldSave) return;
      return request({
        url: "/routers/document/replace",
        method: "POST",
        data: JSON.parse(value),
      }).then(refreshAsync);
    },
    {
      manual: true,
    }
  );

  useKeyPress(["meta.s", "ctrl.s"], (e) => {
    e.preventDefault();
    onSave();
  });

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on" as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      detectIndentation: false,
      insertSpaces: true,
      wordWrap: "on" as const,
      folding: true,
      renderLineHighlight: "line" as const,
      smoothScrolling: true,
      cursorBlinking: "smooth" as const,
      padding: { top: 12, bottom: 12 },
    }),
    []
  );

  const handleBeforeMount = useCallback((monaco: Monaco) => {
    defineCheerfulTheme(monaco);
  }, []);

  const handleMount = useCallback((_: unknown, monaco: Monaco) => {
    monaco.editor.setTheme("cheerful-json");
  }, []);

  return (
    <div
      className="min-h-screen bg-linear-to-br from-amber-50 via-sky-50 to-emerald-50 px-4 py-8 motion-safe:transition-colors"
      style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="text-center sm:text-left">
          <h1
            className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl"
            style={{ fontFamily: "'Fredoka', system-ui, sans-serif" }}
          >
            Routers JSON 编辑器
          </h1>
          <p className="mt-2 text-base text-slate-600">
            编辑内容后点击保存，或使用快捷键{" "}
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              ⌘/Ctrl+S
            </kbd>{" "}
            保存。
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-xl shadow-sky-100/80 ring-1 ring-slate-200/60 backdrop-blur-md">
          <div className="flex flex-col gap-3 border-b border-slate-100/90 bg-linear-to-r from-white/90 to-sky-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={loading || saving || !couldSave}
              onClick={onSave}
              className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-sky-200/90 bg-sky-50/90 px-4 py-2.5 text-sm font-semibold text-sky-900 shadow-sm transition-colors duration-200 hover:bg-sky-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            >
              <IconSave />
              {saving ? "保存中…" : "保存"}
            </button>
          </div>

          <div className="h-[min(70vh,640px)]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                加载中…
              </div>
            ) : (
              <Editor
                height="100%"
                language="json"
                value={value}
                theme="cheerful-json"
                beforeMount={handleBeforeMount}
                onMount={handleMount}
                onChange={(v) => setValue(v ?? "")}
                options={editorOptions}
              />
            )}
          </div>

          <footer
            className="border-t border-slate-100/90 bg-white/70 px-4 py-2.5"
            role="status"
            aria-live="polite"
          >
            <span className="text-sm text-slate-500">修改后请保存。</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
