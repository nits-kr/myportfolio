# Razorpay Test Cards

Use these card numbers only in Razorpay **Test Mode**.

| Network | Card Number | CVV & Expiry Date |
| --- | --- | --- |
| Visa | 4100 2800 0000 1007 | Use a random CVV and any future date |
| Mastercard | 5500 6700 0000 1002 | Use a random CVV and any future date |
| RuPay | 6527 6589 0000 1005 | Use a random CVV and any future date |
| Diners | 3608 280009 1007 | Use a random CVV and any future date |
| Amex | 3402 560004 01007 | Use a random CVV and any future date |

## Error Scenarios

- BAD_REQUEST_ERROR
- GATEWAY_ERROR

Use Razorpay's test flow to simulate success/failure and select failure in the checkout flow when needed.

## Test Cards for International Payments

| Card Network | Card Number | CVV & Expiry Date |
| --- | --- | --- |
| Mastercard | 5555 5555 5555 4444 | Use a random CVV and any future date |
| Mastercard | 5105 1051 0510 5100 | Use a random CVV and any future date |
| Mastercard | 5104 0600 0000 0008 | Use a random CVV and any future date |
| Visa | 4012 8888 8888 1881 | Use a random CVV and any future date |

## Handy Tips (International Test Flow)

For some international test cards, Razorpay may ask for address details. A common test address set:

- Address Line 1: 21 Applegate Apartment
- Address Line 2: Rockledge Street
- City: New York
- State: New York
- Country: US
- Zipcode: 11561

## Test Cards for Subscriptions

| Type | Card Network | Card Type | Card Number | CVV & Expiry Date |
| --- | --- | --- | --- | --- |
| Domestic | Visa | Credit Card | 4718 6091 0820 4366 | Use a random CVV and any future date |
| International | Mastercard | Credit Card | 5104 0155 5555 5558 | Use a random CVV and any future date |
| International | Mastercard | Debit Card | 5104 0600 0000 0008 | Use a random CVV and any future date |

## Test Card for EMI Payments

| Card Network | Card Number | CVV & Expiry Date |
| --- | --- | --- |
| Mastercard | 5241 8100 0000 0000 | Use a random CVV and any future date |

## Notes

- These are for testing only, not real charges.
- Keep Razorpay dashboard in **Test Mode** while using them.
- Verify latest values periodically from official docs:
  - https://razorpay.com/docs/payments/payments/test-card-upi-details/
