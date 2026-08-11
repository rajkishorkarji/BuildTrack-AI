import api from './api';

function loadCheckoutScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
    document.body.appendChild(script);
  });
}

export async function getSubscriptionPlans() {
  const response = await api.get('/payments/razorpay/plans');
  return response.data?.data || {};
}

export async function getSubscriptionStatus() {
  const response = await api.get('/payments/subscription');
  return response.data?.data;
}

export async function getCompanyPayments() {
  const response = await api.get('/payments/company');
  return response.data?.data?.payments || [];
}

export async function startSubscriptionPayment(planCode, planName) {
  // Never send the amount from the browser. The backend owns plan prices.
  const response = await api.post('/payments/razorpay/order', { planCode });
  const order = response.data?.data;

  if (!order?.orderId) {
    throw new Error('Razorpay order was not created');
  }

  // Check if mock mode is active (dev mode without real Razorpay keys)
  if (order.orderId?.startsWith('order_mock_') || order.keyId === 'rzp_test_mock_key') {
    const verifyResponse = await api.post('/payments/razorpay/verify', {
      razorpayOrderId: order.orderId,
      razorpayPaymentId: 'pay_mock_' + Date.now(),
      razorpaySignature: 'mock_valid_signature',
    });
    return verifyResponse.data?.data || { status: 'SUCCESS' };
  }

  await loadCheckoutScript();

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'BuildTrack AI',
      description: `${planName || order.planName} subscription`,
      order_id: order.orderId,
      prefill: {},
      notes: {
        companyPaymentId: String(order.paymentId),
        planCode: order.planCode,
      },
      handler: async (paymentResponse) => {
        try {
          const verifyResponse = await api.post('/payments/razorpay/verify', {
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpaySignature: paymentResponse.razorpay_signature,
          });

          resolve(verifyResponse.data?.data || paymentResponse);
        } catch (error) {
          reject(
            new Error(
              error?.response?.data?.message ||
              'Payment completed but verification failed'
            )
          );
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment window closed')),
      },
    });

    checkout.on('payment.failed', (response) => {
      reject(new Error(response?.error?.description || 'Razorpay payment failed'));
    });

    checkout.open();
  });
}
