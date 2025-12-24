import tweepy
from typing import Optional, List
from datetime import datetime, timedelta
from ..config import settings


class TwitterService:
    """Service for interacting with Twitter/X API"""
    
    def __init__(self):
        self.api_key = settings.twitter_api_key
        self.api_secret = settings.twitter_api_secret
        self.access_token = settings.twitter_access_token
        self.access_token_secret = settings.twitter_access_token_secret
        self.bearer_token = settings.twitter_bearer_token
        
        self.client = None
        self.api = None
        
        if self.is_configured():
            self._initialize_client()
    
    def is_configured(self) -> bool:
        """Check if Twitter service is configured"""
        return bool(self.bearer_token or (self.api_key and self.api_secret))
    
    def _initialize_client(self):
        """Initialize Twitter API client"""
        try:
            # Twitter API v2 client
            if self.bearer_token:
                self.client = tweepy.Client(
                    bearer_token=self.bearer_token,
                    consumer_key=self.api_key,
                    consumer_secret=self.api_secret,
                    access_token=self.access_token,
                    access_token_secret=self.access_token_secret,
                    wait_on_rate_limit=True
                )
            
            # Twitter API v1.1 for some features
            if self.api_key and self.api_secret and self.access_token and self.access_token_secret:
                auth = tweepy.OAuthHandler(self.api_key, self.api_secret)
                auth.set_access_token(self.access_token, self.access_token_secret)
                self.api = tweepy.API(auth, wait_on_rate_limit=True)
        except Exception as e:
            print(f"Error initializing Twitter client: {e}")
    
    async def search_tweets(
        self,
        query: str,
        max_results: int = 100,
        since_hours: int = 24
    ) -> List[dict]:
        """Search for tweets matching a query"""
        if not self.client:
            return []
        
        try:
            # Calculate start time
            start_time = datetime.utcnow() - timedelta(hours=since_hours)
            
            # Search tweets using v2 API
            response = self.client.search_recent_tweets(
                query=query,
                max_results=min(max_results, 100),
                start_time=start_time,
                tweet_fields=["created_at", "public_metrics", "author_id", "lang"],
                user_fields=["name", "username"],
                expansions=["author_id"]
            )
            
            if not response.data:
                return []
            
            # Build user lookup
            users = {}
            if response.includes and "users" in response.includes:
                for user in response.includes["users"]:
                    users[user.id] = {
                        "name": user.name,
                        "username": user.username
                    }
            
            tweets = []
            for tweet in response.data:
                author = users.get(tweet.author_id, {})
                metrics = tweet.public_metrics or {}
                
                tweets.append({
                    "platform_id": str(tweet.id),
                    "author_handle": author.get("username", "unknown"),
                    "author_name": author.get("name"),
                    "content": tweet.text,
                    "url": f"https://twitter.com/{author.get('username', 'i')}/status/{tweet.id}",
                    "likes": metrics.get("like_count", 0),
                    "shares": metrics.get("retweet_count", 0),
                    "comments": metrics.get("reply_count", 0),
                    "posted_at": tweet.created_at,
                    "language": tweet.lang
                })
            
            return tweets
        
        except Exception as e:
            print(f"Error searching tweets: {e}")
            return []
    
    async def get_user_tweets(
        self,
        username: str,
        max_results: int = 50
    ) -> List[dict]:
        """Get tweets from a specific user"""
        if not self.client:
            return []
        
        try:
            # Get user ID
            user = self.client.get_user(username=username)
            if not user.data:
                return []
            
            user_id = user.data.id
            
            # Get user tweets
            response = self.client.get_users_tweets(
                id=user_id,
                max_results=min(max_results, 100),
                tweet_fields=["created_at", "public_metrics"],
            )
            
            if not response.data:
                return []
            
            tweets = []
            for tweet in response.data:
                metrics = tweet.public_metrics or {}
                
                tweets.append({
                    "platform_id": str(tweet.id),
                    "author_handle": username,
                    "author_name": user.data.name,
                    "content": tweet.text,
                    "url": f"https://twitter.com/{username}/status/{tweet.id}",
                    "likes": metrics.get("like_count", 0),
                    "shares": metrics.get("retweet_count", 0),
                    "comments": metrics.get("reply_count", 0),
                    "posted_at": tweet.created_at
                })
            
            return tweets
        
        except Exception as e:
            print(f"Error getting user tweets: {e}")
            return []
    
    async def search_governance_topics(
        self,
        topics: List[str] = None,
        location: str = "Nigeria",
        max_results: int = 100
    ) -> List[dict]:
        """Search for tweets about governance topics in Nigeria"""
        
        default_topics = [
            "Nigerian government",
            "NASS Nigeria",
            "House of Reps Nigeria",
            "Senate Nigeria",
            "Governor Nigeria",
            "LGA Nigeria"
        ]
        
        search_topics = topics or default_topics
        all_tweets = []
        
        for topic in search_topics:
            query = f"{topic} lang:en -is:retweet"
            tweets = await self.search_tweets(query, max_results=max_results // len(search_topics))
            all_tweets.extend(tweets)
        
        # Remove duplicates
        seen = set()
        unique_tweets = []
        for tweet in all_tweets:
            if tweet["platform_id"] not in seen:
                seen.add(tweet["platform_id"])
                unique_tweets.append(tweet)
        
        return unique_tweets


# Singleton instance
twitter_service = TwitterService()


