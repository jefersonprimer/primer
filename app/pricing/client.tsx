'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

interface User {
  id: string;
  email: string;
}

interface PricingClientProps {
  user: User | null;
  loginUrl: string;
}

export function PricingClient({ user, loginUrl }: PricingClientProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success');
  const isCanceled = searchParams.get('canceled');

  const handleSubscribe = useCallback(async (priceId: string) => {
    if (!user) {
      // Salvar o plano escolhido antes de redirecionar para login
      localStorage.setItem('pendingPriceId', priceId);
      window.location.href = loginUrl;
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [user, loginUrl]);

  // Processar plano pendente após login com Google
  useEffect(() => {
    const pendingPriceId = localStorage.getItem('pendingPriceId');
    if (user && pendingPriceId && !isProcessing) {
      localStorage.removeItem('pendingPriceId');
      handleSubscribe(pendingPriceId);
    }
  }, [user, handleSubscribe, isProcessing]);

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/month',
      description: 'Perfect for getting started',
      features: ['Basic Analytics', '1 Project', 'Community Support', 'Limited Storage'],
      action: 'Current Plan',
      priceId: null,
    },
    {
      name: 'Plus',
      price: billingInterval === 'month' ? 'R$ 10' : 'R$ 100',
      period: billingInterval === 'month' ? '/month' : '/year',
      description: 'For growing businesses',
      features: ['Advanced Analytics', '5 Projects', 'Priority Support', '10GB Storage', 'Custom Domain'],
      action: 'Subscribe',
      priceId: billingInterval === 'month' ? 'plus-monthly' : 'plus-yearly',
    },
    {
      name: 'Pro',
      price: billingInterval === 'month' ? 'R$ 20' : 'R$ 180',
      period: billingInterval === 'month' ? '/month' : '/year',
      description: 'For large scale applications',
      features: ['Enterprise Analytics', 'Unlimited Projects', '24/7 Support', 'Unlimited Storage', 'SSO', 'Audit Logs'],
      action: 'Subscribe',
      priceId: billingInterval === 'month' ? 'pro-monthly' : 'pro-yearly',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Choose the plan that best fits your needs.
        </p>
        <div className="relative mt-6 bg-gray-100 p-0.5 rounded-lg inline-flex sm:mt-8">
          <button
            type="button"
            onClick={() => setBillingInterval('month')}
            className={`${billingInterval === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
              } relative rounded-md py-2 px-6 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            Monthly billing
          </button>
          <button
            type="button"
            onClick={() => setBillingInterval('year')}
            className={`${billingInterval === 'year' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
              } relative rounded-md py-2 px-6 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            Yearly billing
          </button>
        </div>
      </div>

      {isSuccess && (
        <div className="max-w-7xl mx-auto mt-8 p-4 bg-green-100 text-green-700 rounded-md text-center">
          Thank you for subscribing! Your plan has been updated.
        </div>
      )}

      {isCanceled && (
        <div className="max-w-7xl mx-auto mt-8 p-4 bg-yellow-100 text-yellow-700 rounded-md text-center">
          Subscription canceled. No charges were made.
        </div>
      )}

      <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col"
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                {plan.period && <span className="ml-1 text-xl font-semibold text-gray-500">{plan.period}</span>}
              </p>
              <p className="mt-6 text-gray-500">{plan.description}</p>

              <ul role="list" className="mt-6 space-y-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex">
                    <svg
                      className="flex-shrink-0 w-6 h-6 text-indigo-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => plan.priceId ? handleSubscribe(plan.priceId) : null}
              disabled={!plan.priceId}
              className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${plan.priceId
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-default'
                }`}
            >
              {plan.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
