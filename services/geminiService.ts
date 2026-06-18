
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";

const getApiKey = () => {
  // Use the selected API key if available, otherwise fallback to the default Gemini API key
  return (process.env as any).API_KEY || (process.env as any).GEMINI_API_KEY || '';
};

export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  modelId: string = 'gemini-2.5-flash-image',
  aspectRatio?: string
): Promise<{ imageUrl: string; altText: string | null }> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const config: any = {
        // Updated System Instruction
        systemInstruction: "You are an expert AI image editor for Commercial E-Commerce & Medical Packaging.\n\nCRITICAL CONTEXT:\n- You are processing standard commercial product images.\n- Treat ALL objects neutrally.\n\nCORE CAPABILITIES & RULES:\n\n1. **Advanced OCR & Text Detection**:\n   - **Micro-Text**: Actively scan for small text.\n   - **Stylized Fonts**: Accurately read handwritten, script, neon, and artistic typefaces.\n\n2. **Text Replacement & Typography (STRICT)**:\n   - **Font Style Adherence**: If a specific style is requested, match it exactly. Otherwise, match the original perfectly.\n   - **Visual Matching**: GENERATE NEW TEXT PIXELS to match the original font family, weight, kerning, color, lighting, shadows, and **noise/grain** exactly.\n\n3. **Background & Scene Generation (Creative)**:\n   - When asked to change the background, analyze the product's perspective and lighting.\n   - Generate a **photorealistic** new environment (Studio, Nature, Home) that respects the object's geometry.\n   - **Contact Shadows**: You MUST generate realistic contact shadows (ambient occlusion) where the object touches the new surface to ground it effectively.\n\n4. **Layout Integrity**:\n   - Do not alter surrounding non-text elements unless requested.\n\n5. **SEO Optimization**:\n   - ALWAYS generate a concise, descriptive **Chinese (Simplified)** ALT text for the final result image.\n\nGeneral Editing:\n- Maintain photo-realism.\n- Follow the user's prompt precisely.",
        safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ]
      };

      if (aspectRatio) {
        config.imageConfig = { aspectRatio };
      }

      const response = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
            {
              text: prompt + " (Please also provide a concise Chinese (Simplified) Alt Text for SEO)",
            },
          ],
        },
        config: config
      });

      let imageUrl: string | null = null;
      let altText: string | null = null;

      if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          } else if (part.text) {
             altText = part.text.trim();
          }
        }
      }

      if (imageUrl) {
        return { imageUrl, altText };
      }
      
      const textParts = response.candidates?.[0]?.content?.parts
          ?.filter(p => p.text)
          .map(p => p.text)
          .join(' ');
          
      if (textParts) {
        throw new Error(`Gemini Message: ${textParts}`);
      }

      throw new Error("No image data found in the response.");

    } catch (error: any) {
      console.error(`Gemini API Attempt ${attempt + 1} failed:`, error);
      lastError = error;

      // Handle 403 Permission Denied specifically for paid models
      if (error.status === 403 || (error.message && error.message.includes("PERMISSION_DENIED"))) {
        throw new Error("API 权限不足。当前模型 (Gemini 3.1) 可能需要连接已启用计费的 Google Cloud 项目 API Key。您可以尝试切换到 'Gemini 2.5 Flash (Standard)' 模型。");
      }

      const isClientError = error.status >= 400 && error.status < 500 && error.status !== 429;
      const isRefusal = error.message && error.message.includes("Gemini Message:");
      
      if (isClientError || isRefusal) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(lastError?.message || "Failed to generate image after multiple attempts.");
};

export const generateCompositeImage = async (
  inputs: { base64: string; mimeType: string }[],
  prompt: string,
  modelId: string = 'gemini-2.5-flash-image'
): Promise<{ imageUrl: string; altText: string | null }> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const parts: any[] = inputs.map(input => ({
    inlineData: {
      mimeType: input.mimeType,
      data: input.base64
    }
  }));

  parts.push({ text: prompt + " (Please also provide a concise Chinese (Simplified) Alt Text for SEO)" });

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        },
        systemInstruction: "You are an expert e-commerce graphic designer specializing in high-conversion listing images.\n\nOBJECTIVE: Synthesize the input image(s) into a SINGLE, professional e-commerce main listing image.\n\nSTRICT RULES:\n1. TRUTH IN ADVERTISING: The product in the generated image must visually match the input images EXACTLY. Do not hallucinate features, change text labels, or alter the physical design. Use the input pixels as ground truth.\n2. BACKGROUND: Use a pure white background (#FFFFFF) with absolutely no artifacts.\n3. COMPOSITION & CROPPING: Maximize product visibility. The product should fill approximately 85-90% of the canvas. Reduce empty white space margins to the absolute minimum necessary for aesthetics, ensuring no part of the product is cut off. This is a 'Main Listing Image' style (tight crop).\n4. LAYOUT: If multiple images are provided (e.g. main unit + accessories), arrange them cohesively in a balanced composition. Place accessories naturally near the main unit.\n5. LIGHTING: Apply consistent professional studio lighting and realistic contact shadows to ground the objects naturally.\n6. SEO: Generate a descriptive **Chinese (Simplified)** ALT text.",
        safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ]
      }
    });

    let imageUrl: string | null = null;
    let altText: string | null = null;

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
           altText = part.text.trim();
        }
      }
      
      if (imageUrl) {
        return { imageUrl, altText };
      }

      const textParts = response.candidates[0].content.parts
          .filter(p => p.text)
          .map(p => p.text)
          .join(' ');
      if (textParts) throw new Error(`Gemini Message: ${textParts}`);
    }

    throw new Error("No image generated.");

  } catch (error: any) {
    console.error("Composite generation failed:", error);
    if (error.status === 403 || (error.message && error.message.includes("PERMISSION_DENIED"))) {
      throw new Error("API 权限不足。当前模型可能需要连接已启用计费的 Google Cloud 项目 API Key。您可以尝试切换到 'Gemini 2.5 Flash (Standard)' 模型。");
    }
    throw error;
  }
};

export const generateAltText = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  // Always use a fast, text-capable model for Alt Text, regardless of image editing model
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Generate a concise, SEO-optimized **Chinese (Simplified)** ALT text description for this image. Focus on the main subject, key details, and context for e-commerce or web display.",
          },
        ],
      },
      config: {
        safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ]
      }
    });

    return response.text || "No description generated.";
  } catch (error: any) {
    console.error("Alt text generation failed:", error);
    throw new Error("Failed to generate alt text.");
  }
};

export const generateSeoMetadata = async (
  base64Image: string,
  mimeType: string,
  keywords: string,
  namingPattern: string
): Promise<{ fileName: string; altText: string }> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const prompt = `
    Analyze the uploaded image.
    Context Keywords provided by user: "${keywords}".
    Desired Filename Pattern: "${namingPattern}".

    Tasks:
    1. Generate an SEO-friendly filename based on the content and the pattern. 
       - Use lowercase, hyphens for spaces.
       - Ensure it ends with the extension specified in the pattern (e.g. .png, .jpg). If no extension is specified in the pattern, default to .png.
       - If the pattern has dynamic placeholders like {color} or {item}, infer them from the image.
    2. Generate an optimized **Chinese (Simplified)** ALT text description incorporating the keywords naturally.

    Return JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // SEO uses Flash for speed and reasoning
      contents: {
        parts: [
            {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image
                }
            },
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fileName: { type: Type.STRING, description: "The optimized filename including extension" },
            altText: { type: Type.STRING, description: "The SEO friendly alt text in Chinese (Simplified)" }
          },
          required: ["fileName", "altText"]
        },
        safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
             {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ]
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      fileName: result.fileName || "image.png",
      altText: result.altText || ""
    };

  } catch (error: any) {
    console.error("SEO Metadata generation failed:", error);
    throw error;
  }
};