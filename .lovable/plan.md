
# Direct Bank Transfer Payment System

## Overview
This plan replaces the Paystack-based payment system with a direct bank transfer flow where users transfer to a GTBank account and upload their receipt for manual admin verification.

## Bank Account Details
- **Bank**: GTBank
- **Account Number**: 0747038903
- **Account Name**: GRAND WORD MEDIA AND PUBLISHERS

---

## What Will Change

### User Experience Flow (All Payments)

**Current Flow:**
1. User clicks "Pay" or "Upgrade"
2. Paystack popup opens
3. User pays via card/bank
4. Automatic confirmation

**New Flow:**
1. User clicks "Pay" or "Upgrade"
2. Dialog shows bank details (GTBank, 0747038903, GRAND WORD MEDIA AND PUBLISHERS)
3. User transfers money via their bank app
4. User uploads screenshot/receipt of transfer
5. Admin reviews and approves
6. User gets notified when approved

---

## Technical Implementation

### 1. Database Changes
Create the required storage bucket for receipt uploads (if not exists) and ensure the `payment_receipts` table is used for all payments.

The existing `payment_receipts` table already has the needed structure:
- `user_id`, `amount`, `receipt_url`, `bank_reference`, `status`, `payment_type`

We'll use this for both premium upgrades and booking payments by setting appropriate `payment_type` values.

### 2. Files to Create

**`src/components/BankTransferDialog.tsx`** (New)
- Reusable component showing bank details
- Upload functionality for payment receipts
- Displays status of pending receipts
- Used for both premium upgrades and booking payments

**`src/hooks/usePaymentReceipts.tsx`** (New)
- Hook to submit payment receipts to `payment_receipts` table
- Query user's payment receipt status
- Upload receipt images to storage

### 3. Files to Modify

**`src/hooks/usePremiumPayment.tsx`**
- Remove all Paystack integration code
- Replace with bank transfer receipt submission
- Store pending payment in `payment_receipts` with `payment_type: 'premium_upgrade'`

**`src/components/PremiumGate.tsx`**
- Update to open BankTransferDialog instead of triggering Paystack
- Show pending status if user has submitted a receipt awaiting approval

**`src/hooks/usePayments.tsx`**
- Remove Paystack integration from booking payments
- Use bank transfer flow for bookings too
- Submit to `payment_receipts` with `payment_type: 'booking'`

**`src/components/BookingDialog.tsx`**
- After booking is created, show bank transfer dialog
- Allow users to upload receipt for booking payment

**`src/pages/AdminPanel.tsx`**
- Add new tab for "Payment Receipts"
- Show pending receipts with user info, amount, receipt image
- Approve/Reject buttons
- On approval: update profile `is_premium` or booking `payment_status`

### 4. Storage Setup
- Create `payment-receipts` storage bucket for uploaded receipt images
- Add RLS policies: users can upload own receipts, admins can view all

---

## Component Structure

```text
BankTransferDialog
├── Bank Details Display
│   ├── Bank Name: GTBank
│   ├── Account Number: 0747038903
│   ├── Account Name: GRAND WORD MEDIA AND PUBLISHERS
│   └── Amount to transfer
├── Receipt Upload Section
│   ├── File picker (images/PDF)
│   ├── Optional bank reference input
│   └── Submit button
└── Status Section
    └── Shows if receipt is pending/approved/rejected
```

---

## Admin Review Flow

1. Admin navigates to Admin Panel → "Payment Receipts" tab
2. Sees list of pending receipts with:
   - User info (name, email)
   - Amount
   - Payment type (Premium Upgrade / Booking)
   - Receipt image (viewable/downloadable)
   - Bank reference (if provided)
   - Submission date
3. Admin clicks receipt to view full image
4. Admin verifies against bank statement
5. Admin clicks "Approve" or "Reject"
   - **Approve Premium**: Sets `profiles.is_premium = true`
   - **Approve Booking**: Sets `bookings.payment_status = 'completed'`
   - **Reject**: Shows reason input, saves to record

---

## Files Summary

| Action | File |
|--------|------|
| Create | `src/components/BankTransferDialog.tsx` |
| Create | `src/hooks/usePaymentReceipts.tsx` |
| Modify | `src/hooks/usePremiumPayment.tsx` |
| Modify | `src/components/PremiumGate.tsx` |
| Modify | `src/hooks/usePayments.tsx` |
| Modify | `src/components/BookingDialog.tsx` |
| Modify | `src/pages/AdminPanel.tsx` |
| Database | Create `payment-receipts` storage bucket |

---

## Edge Cases Handled

- User can see their pending receipt status
- User cannot submit multiple receipts for same payment
- Admin sees all pending receipts across payment types
- Rejected receipts show reason and allow resubmission
- Premium status only activates after admin approval

