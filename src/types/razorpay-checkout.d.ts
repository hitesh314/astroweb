export type RazorpaySuccessPayload = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOpenOptions = {
  key: string;
  amount: string | number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpaySuccessPayload) => void;
  prefill?: { email?: string; contact?: string; name?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: "payment.failed", handler: (r: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOpenOptions) => RazorpayInstance;
  }
}

export type {};
