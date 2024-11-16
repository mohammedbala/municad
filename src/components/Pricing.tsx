import React from 'react';
import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for getting started with traffic control planning',
    features: [
      { name: 'Basic MUTCD Signs Library', included: true },
      { name: 'Single Page Plans', included: true },
      { name: 'Standard Map View', included: true },
      { name: 'Basic Drawing Tools', included: true },
      { name: 'Export as PNG', included: true },
      { name: 'Community Support', included: true },
      { name: 'Advanced MUTCD Signs Library', included: false },
      { name: 'Multi-Page Plans', included: false },
      { name: 'Satellite & Custom Map Views', included: false },
      { name: 'Advanced Drawing Tools', included: false },
      { name: 'Export as PDF/DWG', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Team Collaboration', included: false },
      { name: 'Custom Templates', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/signin',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '99',
    description: 'Professional features for serious traffic control planners',
    features: [
      { name: 'Basic MUTCD Signs Library', included: true },
      { name: 'Single Page Plans', included: true },
      { name: 'Standard Map View', included: true },
      { name: 'Basic Drawing Tools', included: true },
      { name: 'Export as PNG', included: true },
      { name: 'Community Support', included: true },
      { name: 'Advanced MUTCD Signs Library', included: true },
      { name: 'Multi-Page Plans', included: true },
      { name: 'Satellite & Custom Map Views', included: true },
      { name: 'Advanced Drawing Tools', included: true },
      { name: 'Export as PDF/DWG', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Team Collaboration', included: true },
      { name: 'Custom Templates', included: true },
    ],
    cta: 'Go Premium',
    ctaLink: '/signin?plan=premium',
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section className="bg-[#F0F7FF] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 text-[#1E3A8A]">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Choose the plan that's right for you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                bg-white rounded-lg border-4 ${plan.highlight ? 'border-[#2563EB]' : 'border-[#1E3A8A]'}
                shadow-[8px_8px_0px_0px_${plan.highlight ? 'rgba(37,99,235,1)' : 'rgba(30,58,138,1)'}]
                p-8 relative
              `}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <div className="bg-[#2563EB] text-white text-sm font-bold px-3 py-1">
                    RECOMMENDED
                  </div>
                </div>
              )}

              <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-[#2563EB]' : 'text-[#1E3A8A]'}`}>
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-black">${plan.price}</span>
                {plan.price !== '0' && <span className="text-gray-600">/year</span>}
              </div>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <Link
                to={plan.ctaLink}
                className={`
                  block text-center py-3 px-6 rounded mb-8 font-bold
                  ${plan.highlight
                    ? 'bg-[#2563EB] text-white hover:bg-[#1E40AF]'
                    : 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF]'
                  }
                  transition-colors
                `}
              >
                {plan.cta}
              </Link>

              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature.name} className="flex items-center">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Need a custom plan for your organization?{' '}
            <a href="mailto:sales@municad.com" className="text-[#2563EB] hover:underline font-semibold">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}