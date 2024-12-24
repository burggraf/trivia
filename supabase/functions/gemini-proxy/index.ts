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
        const { prompt } = await req.json();

        if (!prompt) {
            return new Response("Prompt is required.", {
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
                        parts: [{ text: prompt }],
                    },
                ],
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return new Response(JSON.stringify(error), {
                status: response.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const data = await response.json();
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
