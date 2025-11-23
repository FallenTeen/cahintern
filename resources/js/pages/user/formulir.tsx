import React, { useCallback, useEffect, useRef, useState } from "react";

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, FileText, Download } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { motion, AnimatePresence } from "framer-motion";

type UploadItem = {
  id: string;
  file: File;
  preview?: string;
  progress: number; // 0..100
  status: "idle" | "uploading" | "done" | "error";
};

export default function PremiumFormUpload() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // cleanup objectURLs on unmount
    return () => {
      items.forEach((it) => it.preview && URL.revokeObjectURL(it.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const mapped = arr.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file: f,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      progress: 0,
      status: "idle",
    }));
    setItems((prev) => [...mapped, ...prev]);
  }, []);

  // native drag events
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found && found.preview) URL.revokeObjectURL(found.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const startUploadAll = async () => {
    // simple sequential upload to show per-file progress; adapt to parallel if needed
    for (const it of items) {
      if (it.status === "done") continue;
      await uploadSingle(it.id);
    }
  };

  const uploadSingle = (id: string) => {
    return new Promise<void>((resolve) => {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: "uploading", progress: 0 } : p)));

      const item = items.find((p) => p.id === id);
      if (!item) return resolve();

      const form = new FormData();
      form.append("file", item.file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const percent = Math.round((ev.loaded / ev.total) * 100);
          setItems((prev) => prev.map((p) => (p.id === id ? { ...p, progress: percent } : p)));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: "done", progress: 100 } : p)));
        } else {
          setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: "error" } : p)));
        }
        resolve();
      };

      xhr.onerror = () => {
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: "error" } : p)));
        resolve();
      };

      xhr.send(form);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const downloadTemplate = () => {
    // prefer hosted template; adjust path to your asset
    window.open("formulir/TemplateKesanggupanMahasiswa.doc", "_blank");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl p-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-center mb-4">Upload Formulir</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Label className="mb-2">Template</Label>
                <div className="flex items-center gap-3">
                  <Button onClick={downloadTemplate} className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Download Template
                  </Button>
                </div>

                <Separator className="my-4" />

                <Label className="mb-2">Cara Penggunaan</Label>
                <ul className="text-sm list-disc ml-5 text-muted-foreground">
                  <li>Seret file PDF ke area upload.</li>
                  <li>Klik Upload untuk mengirimkan berkas ke server.</li>
                </ul>
              </div>

              <div className="w-full md:w-2/5">
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`rounded-lg border-2 p-4 transition-colors duration-150 ${
                    dragActive ? "border-blue-400 bg-blue-50" : "border-dashed border-gray-200 bg-white"
                  }`}
                >
                  <motion.div
                    initial={{ opacity: 0.9, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex flex-col items-center justify-center gap-3"
                  >
                    <div className="text-center">
                      <h3 className="font-semibold">Drop files here</h3>
                    </div>

                    <input
                      ref={inputRef}
                      type="file"
                      multiple
                      accept=".pdf"
                      onChange={handleInputChange}
                      className="hidden"
                      id="premium-file-input"
                    />

                    <div className="flex gap-2">
                      <label htmlFor="premium-file-input">
                        <Button variant="secondary">Pilih Berkas</Button>
                      </label>
                      <Button variant="ghost" onClick={() => setItems([])}>Clear All</Button>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-4 space-y-3">
                  <AnimatePresence>
                    {items.map((it) => (
                      <motion.div
                        key={it.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="rounded-md border p-3 bg-white flex items-start gap-3"
                      >
                        <div className="w-14 h-14 flex items-center justify-center rounded-md bg-gray-50 border">
                          {it.preview ? (
                            // image preview
                            <img src={it.preview} alt={it.file.name} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="font-medium">{it.file.name}</div>
                              <div className="text-xs text-muted-foreground">{Math.round(it.file.size / 1024)} KB</div>
                            </div>

                            <div className="flex items-center gap-2">
                              {it.status === "done" && <div className="text-xs text-green-600">Selesai</div>}
                              {it.status === "error" && <div className="text-xs text-red-600">Error</div>}
                              <Button size="sm" variant="ghost" onClick={() => removeItem(it.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2">
                            <Progress value={it.progress} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                  <Button onClick={startUploadAll} disabled={items.length === 0}>
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
