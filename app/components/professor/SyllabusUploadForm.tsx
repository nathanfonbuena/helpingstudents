"use client";

import { useState, useRef } from "react";

interface SyllabusUploadFormProps {
  currentUrl: string | null;
  currentFilename: string | null;
  uploadedAt: Date | null;
}

export default function SyllabusUploadForm({
  currentUrl,
  currentFilename,
  uploadedAt
}: SyllabusUploadFormProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(currentFilename);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrorMsg("Only PDF files are accepted.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("File must be smaller than 8 MB.");
      return;
    }
    setErrorMsg("");
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStatus("uploading");
    setErrorMsg("");

    try {
      // Upload via UploadThing's API
      const formData = new FormData();
      formData.append("files", selectedFile);

      const res = await fetch("/api/uploadthing", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }

      const data = (await res.json()) as Array<{ ufsUrl: string; name: string }>;
      const uploaded = data[0];
      if (!uploaded) throw new Error("No file URL returned");

      setUploadedUrl(uploaded.ufsUrl);
      setUploadedFilename(selectedFile.name);
      setStatus("success");
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  };

  return (
    <section className="portal-section">
      <h2>Syllabus Upload</h2>
      <p className="portal-section__desc">
        Upload a PDF syllabus for students to reference. Max 8 MB. The file
        will be hosted on a secure CDN and displayed on your public profile.
      </p>

      {uploadedUrl && (
        <div className="syllabus-current">
          <span className="syllabus-current__icon">📄</span>
          <div>
            <p className="syllabus-current__name">{uploadedFilename ?? "syllabus.pdf"}</p>
            {uploadedAt && (
              <p className="syllabus-current__date">
                Uploaded{" "}
                {new Date(uploadedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>
            )}
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              View current syllabus →
            </a>
          </div>
        </div>
      )}

      <div className="upload-zone">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="upload-zone__input"
          id="syllabus-file"
          onChange={handleFileChange}
          disabled={status === "uploading"}
        />
        <label htmlFor="syllabus-file" className="upload-zone__label">
          {selectedFile ? (
            <span>{selectedFile.name}</span>
          ) : (
            <>
              <span className="upload-zone__icon">⬆</span>
              <span>Choose PDF or drag here</span>
              <span className="upload-zone__hint">PDF only · max 8 MB</span>
            </>
          )}
        </label>
      </div>

      {errorMsg && <p className="form-error">{errorMsg}</p>}

      {status === "success" && (
        <p className="form-success">Syllabus uploaded successfully.</p>
      )}

      <div className="portal-section__actions">
        <button
          className="btn btn--primary"
          onClick={handleUpload}
          disabled={!selectedFile || status === "uploading"}
        >
          {status === "uploading" ? "Uploading…" : uploadedUrl ? "Replace syllabus" : "Upload syllabus"}
        </button>
      </div>
    </section>
  );
}
