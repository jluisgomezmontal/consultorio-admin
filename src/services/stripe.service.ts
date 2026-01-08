import apiClient from '@/lib/api-client';

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CustomerPortalResponse {
  url: string;
}

class StripeService {
  /**
   * Crear sesión de checkout
   */
  async createCheckoutSession(paquete: string, tipoPago: 'mensual' | 'anual' = 'mensual') {
    const response = await apiClient.post<{ data: CheckoutSessionResponse }>(
      '/stripe/create-checkout-session',
      { paquete, tipoPago }
    );
    return response.data;
  }

  /**
   * Crear portal de cliente
   */
  async createCustomerPortal() {
    const response = await apiClient.post<{ data: CustomerPortalResponse }>(
      '/stripe/create-customer-portal'
    );
    return response.data;
  }

  /**
   * Cancelar suscripción
   */
  async cancelSubscription() {
    const response = await apiClient.post('/stripe/cancel-subscription');
    return response.data;
  }
}

export const stripeService = new StripeService();
