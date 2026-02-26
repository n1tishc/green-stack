"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload, FileText, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { useData } from "@/context/DataContext";

export default function Upload() {
  const { loadSampleData, loadFile, isLoading, error, report } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        loadFile(content, file.name);
      };
      reader.readAsText(file);
    },
    [loadFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.01]"
            : "border-gray-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 bg-gray-50/50 dark:bg-slate-800/30"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              isDragging
                ? "bg-emerald-100 dark:bg-emerald-900/40"
                : "bg-white dark:bg-slate-700 shadow-sm"
            }`}
          >
            <CloudUpload
              className={`w-7 h-7 transition-colors ${
                isDragging ? "text-emerald-600" : "text-gray-400 dark:text-slate-400"
              }`}
            />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
            {isDragging ? "Release to upload" : "Drop your billing file here"}
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            or click to browse &nbsp;·&nbsp; supports{" "}
            <code className="text-emerald-600 dark:text-emerald-400 font-medium">.json</code>
            {" "}and{" "}
            <code className="text-emerald-600 dark:text-emerald-400 font-medium">.csv</code>
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-200 dark:shadow-none"
        >
          <FileText className="w-4 h-4" />
          Choose File
        </button>
        <button
          onClick={loadSampleData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Load Sample
        </button>
      </div>

      {/* Status */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {!error && report && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Loaded {report.resources.length} resources successfully
        </div>
      )}
    </div>
  );
}
