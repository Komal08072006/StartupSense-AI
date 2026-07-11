import os
import json
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List
from .base import BaseAgent

# Competitors Features: param, you, comp1, comp2
class CompetitorsInfo(BaseModel):
    name1: str = Field(description="Name of first major competitor")
    name2: str = Field(description="Name of second major competitor")
    features: List[List[str]] = Field(
        description="List of feature comparison rows. Each row must be a list of exactly 4 elements: [feature_name, your_startup_status, competitor1_status, competitor2_status]. Example: ['Real-time Bio-feedback', 'Yes (AI Camera)', 'No (Manual)', 'No']"
    )

class SwotInfo(BaseModel):
    s: List[str] = Field(description="List of 2-3 key Strengths")
    w: List[str] = Field(description="List of 2-3 key Weaknesses")
    o: List[str] = Field(description="List of 2-3 key Opportunities")
    t: List[str] = Field(description="List of 2-3 key Threats")

class MonetizationChannel(BaseModel):
    name: str = Field(description="Name of the monetization channel")
    weight: int = Field(description="Weight percentage (e.g. 60)")

class LeanCanvasInfo(BaseModel):
    problem: str = Field(description="Problem statement and details")
    solution: str = Field(description="Solution details")
    metrics: str = Field(description="Key metrics to track (e.g., LTV, CAC, Daily active users)")
    value: str = Field(description="Unique Value Proposition")
    advantage: str = Field(description="Unfair Advantage (biometrics, data network effects, custom tech)")
    channels: str = Field(description="Distribution and acquisition channels")
    segments: str = Field(description="Customer segments definition")
    cost: str = Field(description="Key cost elements (hosting, marketing, personnel)")
    revenue: str = Field(description="Revenue streams model details")

class StartupPlan(BaseModel):
    startup_name: List[str] = Field(description="Exactly 3 creative and relevant name options for the startup")
    tagline: str = Field(description="A catchy tagline for the startup")
    problem_statement: str = Field(description="Clear and detailed problem statement")
    solution: str = Field(description="Proposed solution details")
    target_audience: str = Field(description="Description of target audience")
    pain_points: List[str] = Field(description="List of 3 key customer pain points")
    unique_value_proposition: str = Field(description="Unique value proposition (UVP)")
    key_features: List[str] = Field(description="List of 3-4 key product features")
    revenue_model: str = Field(description="Explanation of the revenue model")
    business_model: str = Field(description="Explanation of the overall business model")
    suggested_tech_stack: List[str] = Field(description="List of suggested technologies for the tech stack")
    ai_features: List[str] = Field(description="List of key AI features/enhancements")
    risks: List[str] = Field(description="List of potential business or technical risks")
    future_expansion: List[str] = Field(description="List of 3 future expansion roadmap items")
    startup_category: str = Field(description="Exactly one of the following lowercase tags representing the closest category matching the concept: 'yoga', 'eco', 'calendar', 'camera', or 'generic'")
    business_summary: str = Field(description="Comprehensive executive summary of the business idea")
    
    # Extended fields to support other dashboard sections dynamically
    swot: SwotInfo
    market_size: str = Field(description="Estimated market size SAM, formatted like '₹1,200 Cr / Year' or similar")
    channels: List[MonetizationChannel] = Field(description="List of 3 monetization channels with weights summing to 100")
    competitors: CompetitorsInfo
    canvas: LeanCanvasInfo = Field(description="Full Lean Canvas model fields")
    suggestions: List[str] = Field(description="List of 4 actionable suggestions or next steps")

class StartupAgent(BaseAgent):
    def run(self, input_data: dict) -> dict:
        startup_idea = input_data.get("startupIdea")
        if not startup_idea:
            raise ValueError("No 'startupIdea' provided in request input data.")

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set in Backend/.env. "
                "Please configure a valid Gemini API key to proceed."
            )

        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        
        prompt = f"""
You are a highly experienced startup consultant agent.
Generate a comprehensive, structured startup validation and analysis report for this startup concept:
"{startup_idea}"

Express all financial details, pricing tiers, market sizes, and monetary values in Indian Rupees (₹ / INR) instead of USD/dollars.
Ensure the results are highly relevant to the concept, realistic, and written in a premium, professional business tone.
"""

        try:
            print(f"Calling Gemini API with model: {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=StartupPlan,
                ),
            )
            raw_text = response.text
        except Exception as err:
            raise RuntimeError(f"Gemini API request failed: {str(err)}")

        # Parse the JSON response
        try:
            result = json.loads(raw_text)
            return result
        except Exception as parse_err:
            raise RuntimeError(f"Failed to parse Gemini response as JSON: {str(parse_err)}\nRaw response: {raw_text}")
