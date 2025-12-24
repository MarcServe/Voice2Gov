"""
Grok (X/Twitter AI) Service for Voice2Gov
- Real-time Twitter/X analysis
- Trending topics in Nigerian governance
- Influencer tracking
"""

import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json

from ..config import settings


class GrokService:
    """Service for Grok AI (X/Twitter AI) integration"""
    
    def __init__(self):
        # Grok API uses X's API infrastructure
        self.api_key = getattr(settings, 'grok_api_key', '') or getattr(settings, 'twitter_bearer_token', '')
        self.base_url = "https://api.x.ai/v1"  # Grok API endpoint
    
    def is_configured(self) -> bool:
        """Check if Grok is configured"""
        return bool(self.api_key)
    
    async def _make_request(self, endpoint: str, data: Dict) -> Optional[Dict]:
        """Make a request to Grok API"""
        if not self.is_configured():
            return None
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/{endpoint}",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json=data,
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"Grok API error: {response.status_code} - {response.text}")
                    return None
            except Exception as e:
                print(f"Grok request error: {e}")
                return None
    
    async def analyze_twitter_sentiment(self, tweets: List[str]) -> Dict[str, Any]:
        """Analyze sentiment of Twitter posts about Nigerian governance"""
        
        # Combine tweets for analysis
        tweets_text = "\n\n".join([f"Tweet {i+1}: {t}" for i, t in enumerate(tweets[:20])])
        
        data = {
            "model": "grok-beta",
            "messages": [
                {
                    "role": "system",
                    "content": """You are Grok, an AI assistant analyzing Nigerian Twitter discourse.
                    Analyze the tweets and provide:
                    1. Overall sentiment (positive/negative/neutral/mixed)
                    2. Key themes being discussed
                    3. Level of engagement and urgency
                    4. Notable influencers or accounts mentioned
                    5. Actionable insights for government officials
                    
                    Be direct, factual, and consider Nigerian political context."""
                },
                {
                    "role": "user",
                    "content": f"Analyze these Nigerian governance-related tweets:\n\n{tweets_text}"
                }
            ],
            "temperature": 0.5
        }
        
        result = await self._make_request("chat/completions", data)
        
        if result and "choices" in result:
            return {
                "analysis": result["choices"][0]["message"]["content"],
                "model": "grok-beta",
                "analyzed_at": datetime.utcnow().isoformat()
            }
        
        return {"error": "Unable to analyze tweets", "analyzed_at": datetime.utcnow().isoformat()}
    
    async def get_trending_governance_topics(self, state: Optional[str] = None) -> Dict[str, Any]:
        """Get trending governance topics in Nigeria"""
        
        location_context = f" in {state} State" if state else " in Nigeria"
        
        data = {
            "model": "grok-beta",
            "messages": [
                {
                    "role": "system",
                    "content": f"""You are Grok, with real-time access to X/Twitter data.
                    Identify trending governance and political topics{location_context}.
                    Focus on:
                    - Government policies being discussed
                    - Citizen complaints and concerns
                    - Viral posts about elected officials
                    - Infrastructure and development issues
                    - Security concerns
                    
                    Return structured data about each trending topic."""
                },
                {
                    "role": "user",
                    "content": f"What are the current trending governance topics{location_context}?"
                }
            ],
            "temperature": 0.3
        }
        
        result = await self._make_request("chat/completions", data)
        
        if result and "choices" in result:
            return {
                "topics": result["choices"][0]["message"]["content"],
                "location": state or "Nigeria",
                "retrieved_at": datetime.utcnow().isoformat()
            }
        
        return {"error": "Unable to fetch trending topics"}
    
    async def track_representative_mentions(self, representative_name: str, twitter_handle: Optional[str] = None) -> Dict[str, Any]:
        """Track what people are saying about a specific representative"""
        
        search_terms = f"{representative_name}"
        if twitter_handle:
            search_terms += f" OR @{twitter_handle.replace('@', '')}"
        
        data = {
            "model": "grok-beta",
            "messages": [
                {
                    "role": "system",
                    "content": """You are Grok, analyzing Twitter mentions of Nigerian politicians.
                    Provide a summary of:
                    1. Recent mentions and their sentiment
                    2. Key issues constituents are raising
                    3. Praise or criticism trends
                    4. Engagement metrics (approximate)
                    5. Notable accounts discussing this representative
                    
                    Be objective and factual."""
                },
                {
                    "role": "user",
                    "content": f"Analyze recent Twitter mentions of: {search_terms}"
                }
            ],
            "temperature": 0.4
        }
        
        result = await self._make_request("chat/completions", data)
        
        if result and "choices" in result:
            return {
                "representative": representative_name,
                "twitter_handle": twitter_handle,
                "analysis": result["choices"][0]["message"]["content"],
                "analyzed_at": datetime.utcnow().isoformat()
            }
        
        return {"error": "Unable to track mentions"}
    
    async def generate_weekly_twitter_report(self, representative_id: int, representative_name: str) -> Dict[str, Any]:
        """Generate a weekly Twitter report for a representative"""
        
        data = {
            "model": "grok-beta",
            "messages": [
                {
                    "role": "system",
                    "content": """You are Grok, generating a professional weekly social media report for a Nigerian elected official.
                    The report should include:
                    
                    1. EXECUTIVE SUMMARY
                       - Overall sentiment this week
                       - Key metrics (mentions, engagement)
                    
                    2. TOP ISSUES RAISED
                       - Main concerns from constituents
                       - Trending hashtags related to the official
                    
                    3. POSITIVE FEEDBACK
                       - Praise and support received
                       - Successful initiatives mentioned
                    
                    4. AREAS OF CONCERN
                       - Criticisms and complaints
                       - Issues needing attention
                    
                    5. RECOMMENDATIONS
                       - Suggested responses
                       - Communication opportunities
                    
                    Format as a professional government report."""
                },
                {
                    "role": "user",
                    "content": f"Generate a weekly Twitter report for {representative_name} covering the past 7 days."
                }
            ],
            "temperature": 0.5
        }
        
        result = await self._make_request("chat/completions", data)
        
        if result and "choices" in result:
            return {
                "representative_id": representative_id,
                "representative_name": representative_name,
                "report": result["choices"][0]["message"]["content"],
                "period": {
                    "start": (datetime.utcnow() - timedelta(days=7)).isoformat(),
                    "end": datetime.utcnow().isoformat()
                },
                "generated_at": datetime.utcnow().isoformat()
            }
        
        return {"error": "Unable to generate report"}
    
    async def fact_check_claim(self, claim: str) -> Dict[str, Any]:
        """Fact-check a claim about Nigerian governance"""
        
        data = {
            "model": "grok-beta",
            "messages": [
                {
                    "role": "system",
                    "content": """You are Grok, fact-checking claims about Nigerian governance.
                    Analyze the claim and provide:
                    1. Verdict: TRUE, FALSE, PARTIALLY TRUE, UNVERIFIABLE
                    2. Evidence supporting or refuting the claim
                    3. Context that might be missing
                    4. Sources (if available)
                    
                    Be objective and cite real information when possible."""
                },
                {
                    "role": "user",
                    "content": f"Fact-check this claim about Nigerian governance:\n\n{claim}"
                }
            ],
            "temperature": 0.2
        }
        
        result = await self._make_request("chat/completions", data)
        
        if result and "choices" in result:
            return {
                "claim": claim,
                "analysis": result["choices"][0]["message"]["content"],
                "checked_at": datetime.utcnow().isoformat()
            }
        
        return {"error": "Unable to fact-check claim"}


# Singleton instance
grok_service = GrokService()
