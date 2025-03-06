import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from "os";
import { pdf } from "pdf-to-img";

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
    dangerouslyAllowBrowser: true  // Enable browser usage
});

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await (file as File).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const document = await pdf(buffer, {scale: 3});
        const page1Buffer = await document.getPage(1);

        // Create a temporary file path
        const tempDir = path.join(tmpdir(), `pdf-${Date.now()}`);
        const tempFile = path.join(tempDir, 'input.png');

        // Create temp directory and write the file
        await fs.mkdir(tempDir, { recursive: true });
        await fs.writeFile(tempFile, page1Buffer);

        //await fs.rm(tempDir, { recursive: true, force: true });
        
        const response = await groq.chat.completions.create({
            model: "llama-3.2-11b-vision-preview",
            messages:[
                { 
                    role: "user", 
                    content: [
                        {"type": "text", "text": "Please extract the text from the image and return the pure text to me."},
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/png;base64,${page1Buffer.toString('base64')}`
                            },
                        },
                    ],
                }
            ]
        });

        return NextResponse.json({ response: response.choices[0].message.content });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}