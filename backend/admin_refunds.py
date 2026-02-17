"""
Admin API endpoints for managing Stripe refunds.
"""
from flask import Blueprint, jsonify, request
from datetime import datetime

# Mock data for demonstration - in production, this would come from a database
refunds_db = [
    {
        "id": "re_1234567890",
        "payment_intent_id": "pi_abc123",
        "amount": 5000,  # in cents
        "currency": "usd",
        "status": "pending",
        "reason": "Customer requested refund",
        "created_at": "2026-02-15T10:30:00Z",
        "customer_email": "customer1@example.com"
    },
    {
        "id": "re_0987654321",
        "payment_intent_id": "pi_def456",
        "amount": 2500,
        "currency": "usd",
        "status": "processed",
        "reason": "Duplicate charge",
        "created_at": "2026-02-14T14:20:00Z",
        "customer_email": "customer2@example.com"
    }
]

admin_refunds_bp = Blueprint('admin_refunds', __name__, url_prefix='/admin')


@admin_refunds_bp.route('/refunds', methods=['GET'])
def list_refunds():
    """List all refunds with payment information."""
    # In production, this would query the database and include actual payment info
    refunds = []
    for refund in refunds_db:
        refunds.append({
            "id": refund["id"],
            "payment_intent_id": refund["payment_intent_id"],
            "amount": refund["amount"],
            "currency": refund["currency"],
            "status": refund["status"],
            "reason": refund["reason"],
            "created_at": refund["created_at"],
            "customer_email": refund["customer_email"],
            "formatted_amount": f"${refund['amount'] / 100:.2f}"
        })
    
    return jsonify({
        "success": True,
        "data": refunds,
        "total": len(refunds)
    }), 200


@admin_refunds_bp.route('/refunds/<payment_intent_id>', methods=['POST'])
def process_refund(payment_intent_id):
    """Process a refund for a given payment intent."""
    data = request.get_json() or {}
    reason = data.get('reason', 'Requested by customer')
    
    # Check if refund already exists
    existing_refund = next(
        (r for r in refunds_db if r["payment_intent_id"] == payment_intent_id),
        None
    )
    
    if existing_refund and existing_refund["status"] == "processed":
        return jsonify({
            "success": False,
            "error": "Refund already processed for this payment"
        }), 400
    
    # In production, this would call stripe_integration.refund_payment()
    # from backend.stripe_integration import refund_payment
    # result = refund_payment(payment_intent_id, reason)
    
    # Simulated refund processing
    new_refund = {
        "id": f"re_{int(datetime.utcnow().timestamp())}",
        "payment_intent_id": payment_intent_id,
        "amount": existing_refund["amount"] if existing_refund else 0,
        "currency": "usd",
        "status": "processed",
        "reason": reason,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "customer_email": existing_refund["customer_email"] if existing_refund else "unknown@example.com"
    }
    
    # Update existing refund or add new one
    if existing_refund:
        existing_refund["status"] = "processed"
        existing_refund["reason"] = reason
    else:
        refunds_db.append(new_refund)
    
    return jsonify({
        "success": True,
        "data": {
            "id": new_refund["id"] if not existing_refund else existing_refund["id"],
            "payment_intent_id": payment_intent_id,
            "status": "processed",
            "reason": reason,
            "processed_at": new_refund["created_at"]
        }
    }), 200
