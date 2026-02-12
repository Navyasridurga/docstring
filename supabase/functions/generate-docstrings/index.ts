import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, style } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Python code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const styleGuide = {
      google: `Google style docstrings. Example:
"""Summary line.

Args:
    param1 (type): Description.
    param2 (type): Description.

Returns:
    type: Description.

Raises:
    ErrorType: Description.

Examples:
    >>> example_call()
    result
"""`,
      numpy: `NumPy style docstrings. Example:
"""
Summary line.

Parameters
----------
param1 : type
    Description.
param2 : type
    Description.

Returns
-------
type
    Description.

Raises
------
ErrorType
    Description.

Examples
--------
>>> example_call()
result
"""`,
      restructuredtext: `reStructuredText style docstrings. Example:
"""Summary line.

:param param1: Description.
:type param1: type
:param param2: Description.
:type param2: type
:returns: Description.
:rtype: type
:raises ErrorType: Description.

Example::

    >>> example_call()
    result
"""`
    };

    const selectedStyle = styleGuide[style as keyof typeof styleGuide] || styleGuide.google;

    const systemPrompt = `You are a Python documentation expert. Your task is to add professional docstrings to Python functions and classes.

RULES:
1. Use ${style || "google"} docstring format: ${selectedStyle}
2. Analyze each function/class to understand its purpose, parameters, return values, and potential exceptions.
3. Add docstrings ONLY to functions and classes that don't already have them.
4. Keep existing docstrings unchanged.
5. Do NOT modify any code logic - only add docstrings.
6. Include parameter types when inferable from the code.
7. Include Examples section with realistic usage examples.
8. Return ONLY the complete Python code with docstrings added. No explanations, no markdown code fences.
9. Preserve exact indentation and formatting of the original code.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Add professional docstrings to the following Python code:\n\n${code}`,
            },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-docstrings error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
