"use server";

import { supabase } from "../../lib/supabase";

export interface ComplaintData {
  id?: string;
  tracking_id: string;
  category: string;
  location: string;
  urgency: string;
  status: string;
  description: string;
  created_at?: string;
  isMocked?: boolean;
}

export interface ExtractionResult {
  category: string;
  location: string;
  urgency: string;
  reasoning: string;
  isMocked?: boolean;
}

// In-memory fallback database for sandbox mode (session-level demo realism)
let sandboxComplaintsStore: ComplaintData[] = [];

// Pre-seeded status updates for demo lookups
const SEED_COMPLAINTS: Record<string, ComplaintData> = {
  "NM-2026-0001": {
    tracking_id: "NM-2026-0001",
    category: "Road & Infrastructure",
    location: "Sector 62, Noida",
    urgency: "High",
    status: "Resolved",
    description: "Huge pothole near Noida Sector 62 Metro Station causing extreme traffic gridlock and two-wheeler slips.",
    created_at: "2026-07-01T10:00:00Z",
    isMocked: true
  },
  "NM-2026-0002": {
    tracking_id: "NM-2026-0002",
    category: "Water Supply",
    location: "Indiranagar, Bengaluru",
    urgency: "High",
    status: "Under Review",
    description: "Contaminated brownish water coming from municipal supply taps since Sunday. High risk of disease.",
    created_at: "2026-07-03T14:30:00Z",
    isMocked: true
  },
  "NM-2026-0003": {
    tracking_id: "NM-2026-0003",
    category: "Waste Management",
    location: "Chandni Chowk, Delhi",
    urgency: "Medium",
    status: "Submitted",
    description: "Commercial garbage piled up near Gate 2 of the market area. Emits strong stench and blocks walkers.",
    created_at: "2026-07-05T09:15:00Z",
    isMocked: true
  }
};

const EXTRACTION_PROMPT = `You are a civic issue classifier for the Indian Municipal Authorities. 
Analyze the citizen's complaint description and extract:
1. Category: Must be one of "Road & Infrastructure", "Water Supply", "Waste Management", "Electricity", "Public Health & Sanitation", or "Other".
2. Location: The city, area, sector, street or landmark mentioned in the complaint. If no location is mentioned, fallback to "Not specified".
3. Urgency: Must be "Low", "Medium", or "High" based on safety risks and civic impact.
4. Reasoning: A 1-sentence reasoning summary of why this classification and urgency was chosen.

You must output ONLY raw JSON matching this format:
{
  "category": "extracted category",
  "location": "extracted location",
  "urgency": "Low/Medium/High",
  "reasoning": "1-sentence classification reasoning explanation"
}`;

// Helper to do local rule-based extraction if API keys are missing/fail
function runLocalExtraction(description: string, userLocation?: string): ExtractionResult {
  const descLower = description.toLowerCase();
  let category = "Other";
  let urgency = "Medium";
  let location = userLocation || "Not specified";
  let reasoning = "Classified based on keyword matching.";

  // Category keyword mapping
  if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("street") || descLower.includes("sadak") || descLower.includes("gaddha")) {
    category = "Road & Infrastructure";
    urgency = "High";
    reasoning = "Detected road safety hazards or infrastructure blockages.";
  } else if (descLower.includes("water") || descLower.includes("dirty") || descLower.includes("supply") || descLower.includes("paani") || descLower.includes("jal") || descLower.includes("pipeline")) {
    category = "Water Supply";
    urgency = descLower.includes("dirty") || descLower.includes("no supply") ? "High" : "Medium";
    reasoning = "Detected potable water supply access or contamination issue.";
  } else if (descLower.includes("garbage") || descLower.includes("waste") || descLower.includes("trash") || descLower.includes("kachra") || descLower.includes("clean") || descLower.includes("gandagi")) {
    category = "Waste Management";
    urgency = "Medium";
    reasoning = "Detected solid waste accumulation requiring municipal sanitation truck dispatch.";
  } else if (descLower.includes("light") || descLower.includes("power") || descLower.includes("electricity") || descLower.includes("bijli") || descLower.includes("wire")) {
    category = "Electricity";
    urgency = descLower.includes("wire") || descLower.includes("spark") ? "High" : "Medium";
    reasoning = "Detected power grid supply disruption or live wire safety hazard.";
  } else if (descLower.includes("sewer") || descLower.includes("drain") || descLower.includes("smell") || descLower.includes("mosquito") || descLower.includes("health")) {
    category = "Public Health & Sanitation";
    urgency = "High";
    reasoning = "Detected biological hazards or drainage overflow impacting public health.";
  }

  // Location extraction helper
  if (location === "Not specified") {
    // Look for common patterns: "in Noida", "at Indiranagar", "near Metro Station", "near [capital letters]"
    const nearMatch = description.match(/near\s+([^,.]+)/i);
    const inMatch = description.match(/in\s+([^,.]+)/i);
    const atMatch = description.match(/at\s+([^,.]+)/i);
    if (nearMatch) location = nearMatch[0];
    else if (inMatch) location = inMatch[0];
    else if (atMatch) location = atMatch[0];
  }

  return { category, location, urgency, reasoning, isMocked: true };
}

export async function extractComplaintMetadata(
  description: string,
  userLocation?: string
): Promise<ExtractionResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  try {
    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: EXTRACTION_PROMPT },
                  { text: `Complaint description: "${description}"\nUser supplied location fallback: "${userLocation || 'None'}"` }
                ],
              },
            ],
            generationConfig: { responseMimeType: "application/json" }
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text) as ExtractionResult;
        }
      }
    }

    if (openaiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: EXTRACTION_PROMPT },
            { role: "user", content: `Complaint description: "${description}"\nUser location: "${userLocation || 'None'}"` },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as ExtractionResult;
        }
      }
    }

    if (anthropicKey) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 500,
          system: EXTRACTION_PROMPT + "\nNote: Output valid JSON only.",
          messages: [
            { role: "user", content: `Complaint: "${description}"\nLocation input: "${userLocation || 'None'}"` },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.content?.[0]?.text;
        if (content) {
          return JSON.parse(content) as ExtractionResult;
        }
      }
    }
  } catch (error) {
    console.error("AI extraction failed, using fallback rule engine:", error);
  }

  return runLocalExtraction(description, userLocation);
}

// Generate the next sequential tracking ID
async function generateTrackingId(): Promise<string> {
  const year = new Date().getFullYear();
  
  if (supabase) {
    try {
      // Query the count of complaints to generate sequential ID
      const { count, error } = await supabase
        .from("complaints")
        .select("*", { count: "exact", head: true });
      
      if (!error && count !== null) {
        const nextNum = String(count + 1).padStart(4, "0");
        return `NM-${year}-${nextNum}`;
      }
    } catch (err) {
      console.error("Supabase count lookup failed, generating random tracking id:", err);
    }
  }

  // Fallback tracking ID for sandbox
  const count = sandboxComplaintsStore.length + Object.keys(SEED_COMPLAINTS).length + 1;
  const nextNum = String(count).padStart(4, "0");
  return `NM-${year}-${nextNum}`;
}

export async function createComplaint(
  description: string,
  userLocation?: string
): Promise<{ success: boolean; data?: ComplaintData; error?: string; stepInfo: ExtractionResult }> {
  
  if (!description || description.trim() === "") {
    return { success: false, error: "Complaint description is required", stepInfo: { category: "Unknown", location: "Unknown", urgency: "Low", reasoning: "No description provided." } };
  }

  // 1. Run AI extraction of civic meta-data (Glass Box step)
  const extraction = await extractComplaintMetadata(description, userLocation);

  // 2. Generate tracking ID
  const trackingId = await generateTrackingId();

  const newComplaint: ComplaintData = {
    tracking_id: trackingId,
    category: extraction.category,
    location: extraction.location,
    urgency: extraction.urgency,
    status: "Submitted",
    description: description,
    created_at: new Date().toISOString()
  };

  // 3. Store in Supabase if connection exists
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .insert([newComplaint])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as ComplaintData,
        stepInfo: extraction
      };
    } catch (dbError: any) {
      console.error("Supabase insertion error. Storing in local sandbox memory:", dbError);
      // Fallback to storing in sandbox list so the demo continues to work seamlessly
      newComplaint.isMocked = true;
      sandboxComplaintsStore.push(newComplaint);
      return {
        success: true,
        data: newComplaint,
        stepInfo: {
          ...extraction,
          reasoning: `${extraction.reasoning} (Saved to sandbox memory - Database disconnected)`
        }
      };
    }
  } else {
    // Sandbox mode: save to in-memory store
    newComplaint.isMocked = true;
    sandboxComplaintsStore.push(newComplaint);
    return {
      success: true,
      data: newComplaint,
      stepInfo: {
        ...extraction,
        reasoning: `${extraction.reasoning} (Saved to sandbox memory - Supabase credentials not set)`
      }
    };
  }
}

export async function fetchComplaintById(
  trackingId: string
): Promise<{ success: boolean; data?: ComplaintData; error?: string }> {
  
  const cleanId = trackingId.trim().toUpperCase();

  // 1. Check in seeded demo data
  if (SEED_COMPLAINTS[cleanId]) {
    return { success: true, data: SEED_COMPLAINTS[cleanId] };
  }

  // 2. Check in Supabase if active
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("tracking_id", cleanId)
        .maybeSingle();

      if (!error && data) {
        return { success: true, data: data as ComplaintData };
      }
    } catch (err) {
      console.error("Supabase fetch failed, checking local store fallback:", err);
    }
  }

  // 3. Check in sandbox memory store
  const found = sandboxComplaintsStore.find(c => c.tracking_id === cleanId);
  if (found) {
    return { success: true, data: found };
  }

  if (!supabase) {
    return {
      success: false,
      error: `No complaint found with ID ${cleanId}. Note: Supabase isn't connected, so complaints are stored only in this server instance's temporary memory and won't be found from a different request/deployment. Set up Supabase env vars to fix this permanently.`
    };
  }

  return { success: false, error: `No complaint found with ID ${cleanId}. Double check the ID and try again.` };
}
