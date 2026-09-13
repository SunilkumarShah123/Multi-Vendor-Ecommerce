from decimal import Decimal

import requests
from django.conf import settings


class KhaltiPaymentError(Exception):
	def __init__(self, message, status_code=502, response_data=None):
		super().__init__(message)
		self.status_code = status_code
		self.response_data = response_data


def _request(endpoint, payload):
	secret_key = settings.KHALTI_SECRET_KEY
	if not secret_key:
		raise KhaltiPaymentError("KHALTI_SECRET_KEY is not configured.", status_code=500)

	try:
		response = requests.post(
			f"{settings.KHALTI_API_URL.rstrip('/')}/{endpoint.lstrip('/')}",
			headers={
				"Authorization": f"Key {secret_key}",
				"Content-Type": "application/json",
			},
			json=payload,
			timeout=15,
		)
		response_data = response.json()
	except (requests.RequestException, ValueError) as error:
		raise KhaltiPaymentError(
			f"Unable to connect to Khalti: {error}", status_code=502
		) from error

	if not response.ok:
		raise KhaltiPaymentError(
			"Khalti rejected the payment request.",
			status_code=response.status_code,
			response_data=response_data,
		)
	return response_data


def initiate_payment(order_id, amount, customer_name="Customer", customer_email=""):
	amount = int((Decimal(amount) * 100).quantize(Decimal("1")))
	if amount <= 0:
		raise KhaltiPaymentError("Order total must be greater than zero.", status_code=400)

	return _request(
		"epayment/initiate/",
		{
			"return_url": settings.KHALTI_RETURN_URL,
			"website_url": settings.KHALTI_WEBSITE_URL,
			"amount": amount,
			"purchase_order_id": order_id,
			"purchase_order_name": f"Order {order_id}",
			"customer_info": {
				"name": customer_name or "Customer",
				"email": customer_email or "",
			},
		},
	)


def verify_payment(pidx):
	if not pidx:
		raise KhaltiPaymentError("pidx is required.", status_code=400)
	return _request("epayment/lookup/", {"pidx": pidx})

__all__ = ["KhaltiPaymentError", "initiate_payment", "verify_payment"]
