"""
Web Scraping Service for Voice2Gov
- Scrape NASS website for representative info
- Extract contact information from government websites
- Gather public data about elected officials
"""

import httpx
from bs4 import BeautifulSoup
from typing import Optional, List, Dict, Any
from datetime import datetime
import re
import asyncio

from .openai_service import openai_service


class ScraperService:
    """Service for web scraping Nigerian government websites"""
    
    def __init__(self):
        self.headers = {
            "User-Agent": "Voice2Gov Bot/1.0 (Nigerian Civic Engagement Platform; contact@voice2gov.ng)"
        }
        
        # Known government website URLs
        self.sources = {
            "nass": "https://nass.gov.ng",
            "senate": "https://senate.gov.ng",
            "house": "https://nassnig.org",
            "inec": "https://inecnigeria.org"
        }
    
    async def _fetch_page(self, url: str) -> Optional[str]:
        """Fetch a web page"""
        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                response = await client.get(url, headers=self.headers, timeout=30.0)
                if response.status_code == 200:
                    return response.text
                else:
                    print(f"Failed to fetch {url}: {response.status_code}")
                    return None
            except Exception as e:
                print(f"Error fetching {url}: {e}")
                return None
    
    def _extract_emails(self, text: str) -> List[str]:
        """Extract email addresses from text"""
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, text)
        # Filter out common false positives
        valid_emails = [e for e in emails if not e.endswith('.png') and not e.endswith('.jpg')]
        return list(set(valid_emails))
    
    def _extract_phones(self, text: str) -> List[str]:
        """Extract Nigerian phone numbers from text"""
        # Nigerian phone patterns
        patterns = [
            r'\+234\s*\d{3}\s*\d{3}\s*\d{4}',  # +234 xxx xxx xxxx
            r'\+234\d{10}',                      # +234xxxxxxxxxx
            r'0[789]0\s*\d{4}\s*\d{4}',         # 0x0 xxxx xxxx
            r'0[789]0\d{8}',                     # 0x0xxxxxxxx
        ]
        
        phones = []
        for pattern in patterns:
            phones.extend(re.findall(pattern, text))
        
        return list(set(phones))
    
    def _extract_twitter_handles(self, text: str) -> List[str]:
        """Extract Twitter handles from text"""
        pattern = r'@([A-Za-z0-9_]{1,15})'
        handles = re.findall(pattern, text)
        return list(set(handles))
    
    async def scrape_nass_senators(self) -> List[Dict[str, Any]]:
        """Scrape senator information from NASS website"""
        senators = []
        
        # Try to fetch the senators page
        url = f"{self.sources['nass']}/senators"
        html = await self._fetch_page(url)
        
        if not html:
            # Try alternative URL
            url = f"{self.sources['senate']}/senators"
            html = await self._fetch_page(url)
        
        if html:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Look for senator cards/entries
            # This would need to be adjusted based on actual website structure
            senator_elements = soup.find_all(['div', 'article'], class_=re.compile(r'senator|member|profile', re.I))
            
            for element in senator_elements:
                senator_data = {
                    "name": None,
                    "state": None,
                    "party": None,
                    "district": None,
                    "email": None,
                    "phone": None,
                    "twitter": None,
                    "photo_url": None,
                    "source_url": url
                }
                
                # Extract name
                name_elem = element.find(['h2', 'h3', 'h4', 'span'], class_=re.compile(r'name|title', re.I))
                if name_elem:
                    senator_data["name"] = name_elem.get_text(strip=True)
                
                # Extract other info from text
                text = element.get_text()
                
                # Find state
                for state in ["Lagos", "Kano", "Rivers", "FCT", "Kaduna"]:  # Would use full state list
                    if state in text:
                        senator_data["state"] = state
                        break
                
                # Find party
                for party in ["APC", "PDP", "LP", "NNPP", "APGA"]:
                    if party in text:
                        senator_data["party"] = party
                        break
                
                # Extract contact info
                emails = self._extract_emails(text)
                if emails:
                    senator_data["email"] = emails[0]
                
                phones = self._extract_phones(text)
                if phones:
                    senator_data["phone"] = phones[0]
                
                twitters = self._extract_twitter_handles(text)
                if twitters:
                    senator_data["twitter"] = twitters[0]
                
                # Extract photo
                img = element.find('img')
                if img and img.get('src'):
                    senator_data["photo_url"] = img['src']
                
                if senator_data["name"]:
                    senators.append(senator_data)
        
        return senators
    
    async def scrape_house_reps(self) -> List[Dict[str, Any]]:
        """Scrape House of Representatives members"""
        reps = []
        
        url = f"{self.sources['house']}/members"
        html = await self._fetch_page(url)
        
        if html:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Similar extraction logic as senators
            rep_elements = soup.find_all(['div', 'article'], class_=re.compile(r'member|rep|profile', re.I))
            
            for element in rep_elements:
                rep_data = {
                    "name": None,
                    "state": None,
                    "constituency": None,
                    "party": None,
                    "email": None,
                    "phone": None,
                    "twitter": None,
                    "source_url": url
                }
                
                name_elem = element.find(['h2', 'h3', 'h4', 'span'], class_=re.compile(r'name|title', re.I))
                if name_elem:
                    rep_data["name"] = name_elem.get_text(strip=True)
                
                text = element.get_text()
                
                emails = self._extract_emails(text)
                if emails:
                    rep_data["email"] = emails[0]
                
                if rep_data["name"]:
                    reps.append(rep_data)
        
        return reps
    
    async def scrape_with_ai(self, url: str, rep_type: str = "senator") -> List[Dict[str, Any]]:
        """Use AI to help extract representative info from any webpage"""
        html = await self._fetch_page(url)
        
        if not html:
            return []
        
        # Clean HTML and extract text
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove script and style elements
        for element in soup(['script', 'style', 'nav', 'footer', 'header']):
            element.decompose()
        
        text = soup.get_text(separator=' ', strip=True)
        
        # Use OpenAI to extract information
        if openai_service.is_configured():
            result = await openai_service.extract_representative_info(text[:4000], rep_type)
            if result and not result.get('error'):
                result['source_url'] = url
                return [result]
        
        return []
    
    async def find_contact_info(self, name: str, state: Optional[str] = None) -> Dict[str, Any]:
        """Search for contact information for a specific representative"""
        results = {
            "name": name,
            "state": state,
            "emails": [],
            "phones": [],
            "twitter": [],
            "sources": []
        }
        
        # Search various sources
        search_queries = [
            f"{name} senator nigeria email",
            f"{name} house of representatives nigeria contact",
            f"{name} {state} politician contact" if state else None
        ]
        
        # For now, return empty results - would integrate with search API
        # In production, you'd use Google Custom Search API or similar
        
        return results
    
    async def scrape_state_government(self, state: str) -> Dict[str, Any]:
        """Scrape state government website for LGA chairman info"""
        # State government website patterns
        state_domains = {
            "Lagos": "lagosstate.gov.ng",
            "Kano": "kanostate.gov.ng",
            "Rivers": "riversstate.gov.ng",
            # Add more states
        }
        
        domain = state_domains.get(state)
        if not domain:
            return {"error": f"No known website for {state} State"}
        
        url = f"https://{domain}/local-government"
        html = await self._fetch_page(url)
        
        if html:
            # Extract LGA information
            soup = BeautifulSoup(html, 'html.parser')
            text = soup.get_text()
            
            return {
                "state": state,
                "source_url": url,
                "raw_text": text[:2000],
                "emails": self._extract_emails(text),
                "phones": self._extract_phones(text)
            }
        
        return {"error": f"Could not fetch data from {domain}"}
    
    async def run_full_scrape(self) -> Dict[str, Any]:
        """Run a full scrape of all known sources"""
        results = {
            "senators": [],
            "house_reps": [],
            "lga_chairmen": [],
            "scraped_at": datetime.utcnow().isoformat(),
            "errors": []
        }
        
        try:
            results["senators"] = await self.scrape_nass_senators()
        except Exception as e:
            results["errors"].append(f"Senators scrape failed: {e}")
        
        try:
            results["house_reps"] = await self.scrape_house_reps()
        except Exception as e:
            results["errors"].append(f"House Reps scrape failed: {e}")
        
        return results


# Singleton instance
scraper_service = ScraperService()
