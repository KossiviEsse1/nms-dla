"use client";
import { useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

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
            console.log(data);
        } catch (error) {
            console.error("Error uploading file:", error);
            setUploadStatus("error");
        }
    }

    return (
        <div>
            <form onSubmit={handleUpload}>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                {file && <div>{file.name}</div>}
                {file && uploadStatus !== "uploading" && <button type="submit">Upload</button>}
            </form>
        </div>
    )
}
