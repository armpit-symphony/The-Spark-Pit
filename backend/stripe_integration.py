"""
Direct Stripe integration - replaces emergentintegrations.payments.stripe.checkout
"""
import stripe
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class CheckoutSessionRequest(BaseModel):
    """Request model for creating a checkout session"""
    mode: str = "payment"
    line_items: list
    success_url: str
    cancel_url: str
    customer_email: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None
    payment_intent_data: Optional[Dict[str, Any]] = None


class StripeCheckout:
    """Direct Stripe Checkout integration"""
    
    def __init__(self, api_key: str = None, webhook_secret: str = None):
        stripe.api_key = api_key
        self.webhook_secret = webhook_secret
    
    async def create_session(self, request: CheckoutSessionRequest) -> dict:
        """Create a Stripe Checkout session"""
        session_data = {
            "mode": request.mode,
            "line_items": request.line_items,
            "success_url": request.success_url,
            "cancel_url": request.cancel_url,
        }
        
        if request.customer_email:
            session_data["customer_email"] = request.customer_email
        
        if request.metadata:
            session_data["metadata"] = request.metadata
        
        if request.payment_intent_data:
            session_data["payment_intent_data"] = request.payment_intent_data
        
        session = stripe.checkout.Session.create(**session_data)
        return {
            "id": session.id,
            "url": session.url,
            "status": session.status
        }
    
    def verify_webhook(self, payload: bytes, signature: str) -> dict:
        """Verify Stripe webhook signature and return event"""
        event = stripe.Webhook.construct_event(
            payload, signature, self.webhook_secret
        )
        return {
            "id": event.id,
            "type": event.type,
            "data": event.data.object
        }
    
    async def refund_payment(self, payment_intent_id: str, amount: int = None, reason: str = None) -> dict:
        """Create a refund for a payment"""
        refund_data = {"payment_intent": payment_intent_id}
        if amount:
            refund_data["amount"] = amount
        if reason:
            refund_data["reason"] = reason
        
        refund = stripe.Refund.create(**refund_data)
        return {
            "id": refund.id,
            "amount": refund.amount,
            "status": refund.status
        }
    
    async def get_session(self, session_id: str) -> dict:
        """Retrieve a checkout session"""
        session = stripe.checkout.Session.retrieve(session_id)
        return {
            "id": session.id,
            "status": session.status,
            "customer_email": session.customer_email,
            "metadata": session.metadata
        }
    
    async def list_refunds(self, payment_intent_id: str = None, limit: int = 10) -> list:
        """List refunds for a payment intent"""
        refund_list = stripe.Refund.list(payment_intent=payment_intent_id, limit=limit)
        return [
            {
                "id": r.id,
                "amount": r.amount,
                "status": r.status,
                "created": datetime.fromtimestamp(r.created).isoformat()
            }
            for r in refund_list.data
        ]
