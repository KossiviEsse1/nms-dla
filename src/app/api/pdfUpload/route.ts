import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import path from "path";
import { writeFile, rm, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { fromPath } from 'pdf2pic';
import sharp from 'sharp';

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

        // Create temporary directory for processing
        const tempDir = path.join(tmpdir(), `pdf-${Date.now()}`);
        const tempFile = path.join(tempDir, 'input.pdf');
        const outputDir = path.join(tempDir, 'output');

        await rm(tempDir, { recursive: true, force: true });
        await rm(outputDir, { recursive: true, force: true });
        // Create directories
        await mkdir(tempDir, { recursive: true });
        await mkdir(outputDir, { recursive: true });

        // Write the uploaded file to temp directory
        const arrayBuffer = await (file as File).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(tempFile, buffer);

        // Convert PDF to image
        const options = {
            density: 300,
            saveFilename: "page-1",
            savePath: outputDir,
            format: "png",
            width: 1024
        };

        const convert = fromPath(tempFile, options);
        const result = await convert(1); // Convert first page

        // Use sharp to convert to JPEG and resize
        const imageBuffer = await sharp(result.path)
            .jpeg({ quality: 90 })
            .resize(1024, null, { fit: 'inside' })
            .toBuffer();

        // Convert to base64
        const base64 = imageBuffer.toString('base64');
        
        const response = await groq.chat.completions.create({
            model: "llama-3.2-11b-vision-preview",
            messages:[
                { 
                    role: "user", 
                    content: [
                        {"type": "text", "text": "What is the text in this image?"},
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64}`
                            },
                        },
                    ],
                }
            ]
        });

        // Clean up temporary files
        await rm(tempDir, { recursive: true, force: true });
        await rm(outputDir, { recursive: true, force: true });

        return NextResponse.json({ response: response.choices[0].message.content });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
