import resend
from typing import Optional, List, Union
from datetime import datetime
from ..config import settings


class EmailService:
    """Service for sending emails via Resend"""
    
    def __init__(self):
        self.api_key = settings.resend_api_key
        self.from_email = settings.from_email
        if self.api_key:
            resend.api_key = self.api_key
    
    def is_configured(self) -> bool:
        """Check if email service is configured"""
        return bool(self.api_key)
    
    async def send_email(
        self,
        to: Union[str, List[str]],
        subject: str,
        html: str,
        text: Optional[str] = None,
        reply_to: Optional[str] = None
    ) -> dict:
        """Send an email"""
        if not self.is_configured():
            return {"success": False, "error": "Email service not configured"}
        
        try:
            params = {
                "from": self.from_email,
                "to": to if isinstance(to, list) else [to],
                "subject": subject,
                "html": html,
            }
            
            if text:
                params["text"] = text
            
            if reply_to:
                params["reply_to"] = reply_to
            
            response = resend.Emails.send(params)
            
            return {
                "success": True,
                "message_id": response.get("id"),
                "sent_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def send_petition_to_representative(
        self,
        representative_email: str,
        representative_name: str,
        petition_title: str,
        petition_description: str,
        signature_count: int,
        petition_url: str,
        creator_name: str
    ) -> dict:
        """Send a petition email to a representative"""
        
        subject = f"[Voice2Gov Petition] {petition_title}"
        
        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #008751; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background: #f9f9f9; }}
                .petition-box {{ background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; }}
                .stats {{ font-size: 24px; color: #008751; font-weight: bold; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                .btn {{ display: inline-block; background: #008751; color: white; padding: 10px 20px; 
                       text-decoration: none; border-radius: 5px; margin-top: 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Voice2Gov</h1>
                    <p>Nigerian Civic Engagement Platform</p>
                </div>
                
                <div class="content">
                    <p>Dear {representative_name},</p>
                    
                    <p>A petition from Nigerian citizens has reached significant support and 
                    requires your attention:</p>
                    
                    <div class="petition-box">
                        <h2>{petition_title}</h2>
                        <p>{petition_description[:500]}{'...' if len(petition_description) > 500 else ''}</p>
                        
                        <p class="stats">{signature_count:,} signatures</p>
                        
                        <p><strong>Submitted by:</strong> {creator_name}</p>
                    </div>
                    
                    <p>This petition was created and signed by your constituents through Voice2Gov, 
                    a platform dedicated to connecting Nigerian citizens with their elected representatives.</p>
                    
                    <p>We kindly request that you:</p>
                    <ul>
                        <li>Review the petition and its supporting comments</li>
                        <li>Acknowledge receipt of this communication</li>
                        <li>Provide a response to the petitioners</li>
                    </ul>
                    
                    <a href="{petition_url}" class="btn">View Full Petition</a>
                    
                    <p style="margin-top: 20px;">Thank you for your service to Nigeria.</p>
                </div>
                
                <div class="footer">
                    <p>This email was sent via Voice2Gov (voice2gov.ng)</p>
                    <p>Empowering Nigerian Citizens to Engage with Government</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(
            to=representative_email,
            subject=subject,
            html=html,
            reply_to="petitions@voice2gov.ng"
        )
    
    async def send_petition_update(
        self,
        user_email: str,
        user_name: str,
        petition_title: str,
        update_type: str,
        update_message: str
    ) -> dict:
        """Send petition status update to user"""
        
        subject = f"[Voice2Gov] Update on your petition: {petition_title}"
        
        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #008751; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .update-box {{ background: #e8f5e9; border-left: 4px solid #008751; padding: 15px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Voice2Gov</h1>
                </div>
                
                <div class="content">
                    <p>Dear {user_name},</p>
                    
                    <p>There's an update on your petition:</p>
                    
                    <h3>{petition_title}</h3>
                    
                    <div class="update-box">
                        <strong>{update_type}</strong>
                        <p>{update_message}</p>
                    </div>
                    
                    <p>Thank you for using Voice2Gov to make your voice heard!</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to=user_email, subject=subject, html=html)


# Singleton instance
email_service = EmailService()

