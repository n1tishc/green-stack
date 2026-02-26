"use client";

import { useState, useCallback, useRef } from "react";
import { Card, Text } from "@tremor/react";
import { Code2, Upload as UploadIcon, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { parseTerraform } from "@/lib/terraform-parser";
import type { CloudResource } from "@/types";

export default function IaCUpload() {
  const { loadFile } = useData();
  const [content, setContent] = useState("");
  const [detected, setDetected] = useState<CloudResource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const analyze = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    setDetected(null);
    try {
      // Try server-side Gemini parsing first
      const resp = await fetch("/api/iac-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.resources && data.resources.length > 0) {
          setDetected(data.resources);
          setLoading(false);
          return;
        }
      }
    } catch {
      // fall through to regex parser
    }
    // Fallback: client-side regex parser
    const resources = parseTerraform(text);
    if (resources.length === 0) {
      setError("No supported resources found (aws_instance, aws_lambda_function, aws_db_instance, aws_s3_bucket).");
    } else {
      setDetected(resources);
    }
    setLoading(false);
  }, []);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      analyze(text);
    };
    reader.readAsText(file);
  }, [analyze]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const loadIntoDashboard = () => {
    if (!detected) return;
    const synthetic = JSON.stringify({ resources: detected });
    loadFile(synthetic, "terraform.json");
  };

  return (
    <div className="space-y-4">
      {/* Drop / paste area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
          isDragging
            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
            : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className={`p-3 rounded-xl ${isDragging ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-gray-100 dark:bg-slate-700"}`}>
            <Code2 className={`w-6 h-6 ${isDragging ? "text-emerald-600" : "text-gray-500 dark:text-slate-400"}`} />
          </div>
          <div className="flex-1">
            <Text className="font-semibold text-gray-800 dark:text-white text-sm">
              Drop a <code>.tf</code> file or paste Terraform HCL below
            </Text>
            <Text className="text-xs text-gray-400 dark:text-slate-500">
              Supports <code>aws_instance</code>, <code>aws_lambda_function</code>, <code>aws_db_instance</code>, <code>aws_s3_bucket</code>
            </Text>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <UploadIcon className="w-4 h-4" />
            Choose .tf File
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".tf,.hcl"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`provider "aws" {\n  region = "us-east-1"\n}\n\nresource "aws_instance" "web" {\n  ami           = "ami-0abcdef"\n  instance_type = "t3.medium"\n}`}
        rows={8}
        className="w-full text-xs font-mono rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={() => content.trim() && analyze(content)}
          disabled={loading || !content.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code2 className="w-4 h-4" />}
          Analyze IaC
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Detected resources table */}
      {detected && detected.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Detected {detected.length} resource{detected.length !== 1 ? "s" : ""}
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 uppercase">
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Service</th>
                  <th className="px-3 py-2 text-left font-medium">Region</th>
                  <th className="px-3 py-2 text-right font-medium">kWh/mo</th>
                  <th className="px-3 py-2 text-right font-medium">Cost/mo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {detected.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-3 py-2 text-gray-700 dark:text-slate-300 font-mono truncate max-w-[160px]">
                      {r.description ?? r.id}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                        {r.service}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{r.region}</td>
                    <td className="px-3 py-2 text-right text-gray-700 dark:text-slate-300">{r.usageKwh.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right text-gray-700 dark:text-slate-300">${r.costUSD.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={loadIntoDashboard}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Load into Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
