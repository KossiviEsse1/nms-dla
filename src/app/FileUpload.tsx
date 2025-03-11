"use client";
import { useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
    const [pdfText, setPdfText] = useState<string>("");
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if(files && files.length > 0) {
            const file = files[0];
            if(file.type === "application/pdf") {
                setFile(file);
            } else {
                alert("Please upload a PDF file");
                return;
            }
        }
    }

    const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(!file) {
            alert("Please upload a PDF file");
            return;
        }

        setUploadStatus("uploading");
        
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/pdfUpload", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            downloadCsv(data.response);
            setPdfText(data.response);
        } catch (error) {
            console.error("Error uploading file:", error);
            setUploadStatus("error");
        }
    }

    const downloadCsv = (csvContent: string, filename = "rfq_requirements.csv") => {
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
    
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return (
        <div>
            <form onSubmit={handleUpload}>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                {file && <div>{file.name}</div>}
                {file && uploadStatus !== "uploading" && <button type="submit">Upload</button>}
            </form>
            {pdfText && <div>{pdfText}</div>}
        </div>
    )
}
