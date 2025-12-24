"""
OpenAI Service for Voice2Gov
- Sentiment analysis of social media posts
- Content extraction from websites
- Summarization of citizen feedback
"""

import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime
import json

from ..config import settings


class OpenAIService:
    """Service for OpenAI GPT integration"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'openai_api_key', '')
        self.model = getattr(settings, 'openai_model', 'gpt-4-turbo-preview')
        self.base_url = "https://api.openai.com/v1"
    
    def is_configured(self) -> bool:
        """Check if OpenAI is configured"""
        return bool(self.api_key)
    
    async def _make_request(self, messages: List[Dict], temperature: float = 0.7) -> Optional[str]:
        """Make a request to OpenAI API"""
        if not self.is_configured():
            return None
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": 2000
                    },
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    print(f"OpenAI API error: {response.status_code} - {response.text}")
                    return None
            except Exception as e:
                print(f"OpenAI request error: {e}")
                return None
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of a social media post"""
        messages = [
            {
                "role": "system",
                "content": """You are a sentiment analysis expert for Nigerian social media content.
                Analyze the given text and return a JSON object with:
                - sentiment: one of "POSITIVE", "NEGATIVE", "NEUTRAL", or "CONSTRUCTIVE"
                - score: a float between -1 (very negative) and 1 (very positive)
                - topics: array of main topics discussed
                - is_constructive: boolean if the feedback is constructive criticism
                - summary: brief summary of the post
                
                Consider Nigerian context, Pidgin English, and local expressions."""
            },
            {
                "role": "user",
                "content": f"Analyze this post:\n\n{text}"
            }
        ]
        
        result = await self._make_request(messages, temperature=0.3)
        
        if result:
            try:
                # Try to parse JSON from response
                # Handle cases where the response might have markdown code blocks
                clean_result = result.strip()
                if clean_result.startswith("```"):
                    clean_result = clean_result.split("```")[1]
                    if clean_result.startswith("json"):
                        clean_result = clean_result[4:]
                return json.loads(clean_result)
            except json.JSONDecodeError:
                return {
                    "sentiment": "NEUTRAL",
                    "score": 0,
                    "topics": [],
                    "is_constructive": False,
                    "summary": text[:100],
                    "raw_analysis": result
                }
        
        return {
            "sentiment": "NEUTRAL",
            "score": 0,
            "topics": [],
            "is_constructive": False,
            "summary": text[:100]
        }
    
    async def analyze_batch(self, posts: List[str]) -> List[Dict[str, Any]]:
        """Analyze multiple posts for sentiment"""
        results = []
        for post in posts:
            result = await self.analyze_sentiment(post)
            results.append(result)
        return results
    
    async def extract_representative_info(self, html_content: str, rep_type: str = "senator") -> Dict[str, Any]:
        """Extract representative information from scraped HTML content"""
        messages = [
            {
                "role": "system",
                "content": f"""You are an expert at extracting Nigerian {rep_type} information from web pages.
                Extract and return a JSON object with:
                - name: full name with title
                - party: political party (APC, PDP, LP, NNPP, etc.)
                - state: Nigerian state they represent
                - constituency: specific constituency or senatorial district
                - email: official email if found
                - phone: phone number if found
                - twitter: Twitter/X handle if found
                - bio: brief biography
                
                Return null for fields not found. Be accurate with Nigerian political context."""
            },
            {
                "role": "user",
                "content": f"Extract {rep_type} information from this content:\n\n{html_content[:4000]}"
            }
        ]
        
        result = await self._make_request(messages, temperature=0.2)
        
        if result:
            try:
                clean_result = result.strip()
                if clean_result.startswith("```"):
                    clean_result = clean_result.split("```")[1]
                    if clean_result.startswith("json"):
                        clean_result = clean_result[4:]
                return json.loads(clean_result)
            except json.JSONDecodeError:
                return {"raw_content": result}
        
        return {}
    
    async def generate_digest_summary(self, posts: List[Dict]) -> str:
        """Generate a summary digest from multiple social media posts"""
        posts_text = "\n\n".join([
            f"- {p.get('author', 'Unknown')}: {p.get('content', '')[:200]}"
            for p in posts[:20]  # Limit to 20 posts
        ])
        
        messages = [
            {
                "role": "system",
                "content": """You are a Nigerian civic engagement analyst. 
                Create a professional digest summary of citizen feedback for elected officials.
                The summary should:
                - Highlight main concerns and themes
                - Note positive feedback
                - Identify constructive suggestions
                - Be respectful and professional
                - Include specific issues mentioned
                Write in clear, formal English suitable for government officials."""
            },
            {
                "role": "user",
                "content": f"Create a digest summary of these citizen posts:\n\n{posts_text}"
            }
        ]
        
        result = await self._make_request(messages, temperature=0.5)
        return result or "Unable to generate summary at this time."
    
    async def translate_to_english(self, text: str, source_language: str = "auto") -> str:
        """Translate Nigerian languages to English"""
        messages = [
            {
                "role": "system",
                "content": """You are an expert translator for Nigerian languages.
                Translate the given text to English. 
                Support: Yoruba, Hausa, Igbo, Pidgin English, and other Nigerian languages.
                Preserve the meaning and cultural context."""
            },
            {
                "role": "user",
                "content": f"Translate to English (from {source_language}):\n\n{text}"
            }
        ]
        
        result = await self._make_request(messages, temperature=0.3)
        return result or text
    
    async def categorize_petition(self, title: str, description: str) -> Dict[str, Any]:
        """Categorize a petition and extract key information"""
        messages = [
            {
                "role": "system",
                "content": """You are a Nigerian civic affairs analyst.
                Analyze the petition and return a JSON object with:
                - category: one of INFRASTRUCTURE, EDUCATION, HEALTHCARE, SECURITY, ECONOMY, ENVIRONMENT, GOVERNANCE, HUMAN_RIGHTS, OTHER
                - priority: HIGH, MEDIUM, or LOW based on urgency
                - affected_area: geographic area affected
                - key_issues: array of main issues raised
                - suggested_actions: array of recommended actions
                - relevant_government_bodies: array of relevant ministries/agencies"""
            },
            {
                "role": "user",
                "content": f"Analyze this petition:\n\nTitle: {title}\n\nDescription: {description}"
            }
        ]
        
        result = await self._make_request(messages, temperature=0.3)
        
        if result:
            try:
                clean_result = result.strip()
                if clean_result.startswith("```"):
                    clean_result = clean_result.split("```")[1]
                    if clean_result.startswith("json"):
                        clean_result = clean_result[4:]
                return json.loads(clean_result)
            except json.JSONDecodeError:
                return {"category": "OTHER", "raw_analysis": result}
        
        return {"category": "OTHER"}

    async def summarize_constitution(self, question: str, sections: List[Dict[str, Any]]) -> str:
        """Answer a question using selected constitution sections"""
        section_text = "\n\n".join(
            f"{sec['chapter']} {sec['section']} - {sec['heading']}:\n{sec['content']}"
            for sec in sections
        )
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a legal assistant for Nigerian citizens. Base your response on the provided sections "
                    "of the 1999 Constitution of Nigeria. Summarize the applicable rights, cite the chapter and section, "
                    "and advise which representative/office the user should contact."
                ),
            },
            {
                "role": "user",
                "content": f"Question: {question}\n\nReferences:\n{section_text}",
            },
        ]
        result = await self._make_request(messages, temperature=0.3)
        return result or "I could not locate the relevant constitutional guidance right now."


# Singleton instance
openai_service = OpenAIService()
