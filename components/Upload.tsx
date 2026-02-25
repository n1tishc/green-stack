"use client";

import { useCallback, useRef, useState } from "react";
import { Card, Text, Button } from "@tremor/react";
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle } from "lucide-react";
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
    <Card
      className={`dark:bg-slate-800 dark:border-slate-700 transition-colors ${isDragging ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          <div className={`p-3 rounded-xl ${isDragging ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-gray-100 dark:bg-slate-700"}`}>
            <UploadIcon className={`w-6 h-6 ${isDragging ? "text-emerald-600" : "text-gray-500 dark:text-slate-400"}`} />
          </div>
          <div>
            <Text className="font-semibold text-gray-800 dark:text-white">
              {isDragging ? "Drop your file here" : "Upload billing data"}
            </Text>
            <Text className="text-xs text-gray-400 dark:text-slate-500">
              Drag &amp; drop or click to upload a <code>.json</code> or <code>.csv</code> file
            </Text>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            <FileText className="inline w-4 h-4 mr-1.5" />
            Choose File
          </button>
          <button
            onClick={loadSampleData}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            Load Sample
          </button>
        </div>
      </div>

      {/* Status */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {!error && report && (
        <div className="mt-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Loaded {report.resources.length} resources successfully.
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".json,.csv"
        className="hidden"
        onChange={onFileChange}
      />
    </Card>
  );
}
