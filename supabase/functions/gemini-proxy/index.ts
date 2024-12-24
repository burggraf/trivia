import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL_NAME = "gemini-2.0-flash-exp";
const API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (!API_KEY) {
        return new Response("GEMINI_API_KEY environment variable is not set.", {
            status: 500,
            headers: corsHeaders,
        });
    }

    try {
        const requestBody = await req.json();
        console.log("Received request body:", requestBody);
        const { contents } = requestBody;
        const promptPart = contents[0].parts.find((part: any) => part.text);
        const imagePart = contents[0].parts.find((part: any) =>
            part.inline_data
        );
        const prompt = promptPart?.text;
        const image = imagePart?.inline_data?.data;
        console.log("Extracted prompt:", prompt);
        console.log(
            "Extracted image (first 50 chars):",
            image?.substring(0, 50),
        );
        if (!prompt && !image) {
            return new Response("Prompt or image is required.", {
                status: 400,
                headers: corsHeaders,
            });
        }

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            ...(prompt ? [{ text: prompt }] : []),
                            ...(image
                                ? [
                                    {
                                        inline_data: {
                                            mime_type: "image/jpeg", // Assuming JPEG, adjust if needed
                                            data: image,
                                        },
                                    },
                                ]
                                : []),
                        ],
                    },
                ],
            }),
        });

        console.log("Gemini API Response Headers:", response.headers);
        const responseText = await response.text();
        console.log("Gemini API Raw Response:", responseText);

        if (!response.ok) {
            try {
                const error = JSON.parse(responseText);
                return new Response(JSON.stringify(error), {
                    status: response.status,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                });
            } catch (e) {
                console.error("Failed to parse error response:", e);
                return new Response(responseText, {
                    status: response.status,
                    headers: { ...corsHeaders, "Content-Type": "text/plain" },
                });
            }
        }

        const data = JSON.parse(responseText);
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return new Response("Failed to call Gemini API.", {
            status: 500,
            headers: corsHeaders,
        });
    }
});
