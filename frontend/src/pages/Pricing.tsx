import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Zap, Crown } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Basic',
      price: '$9',
      period: 'per month',
      description: 'Perfect for individuals and small projects',
      icon: <Star className="w-6 h-6" />,
      features: [
        '50 conversions per month',
        '10MB max file size',
        'PDF, DOCX, TXT, JPG, PNG support',
        'Basic support',
        '30-day file retention'
      ],
      popular: false,
      buttonText: 'Get Started',
      buttonClass: 'bg-gray-900 text-white hover:bg-gray-800'
    },
    {
      name: 'Premium',
      price: '$29',
      period: 'per month',
      description: 'Best for professionals and growing teams',
      icon: <Zap className="w-6 h-6" />,
      features: [
        '500 conversions per month',
        '50MB max file size',
        'All file formats supported',
        'Priority support',
        '30-day file retention',
        'API access',
        'Bulk conversions'
      ],
      popular: true,
      buttonText: 'Start Free Trial',
      buttonClass: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
    },
    {
      name: 'Unlimited',
      price: '$99',
      period: 'per month',
      description: 'For enterprises and power users',
      icon: <Crown className="w-6 h-6" />,
      features: [
        'Unlimited conversions',
        '100MB max file size',
        'All file formats + video/audio',
        'Premium support',
        '90-day file retention',
        'Advanced API features',
        'Custom integrations',
        'Dedicated account manager'
      ],
      popular: false,
      buttonText: 'Contact Sales',
      buttonClass: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start with a 7-day free trial. No credit card required. Cancel anytime.
          </p>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">7-day free trial for all plans</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {plan.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
                      <div className="text-gray-600">{plan.period}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/register"
                    className={`w-full py-3 px-4 rounded-lg font-medium text-center transition-all duration-300 block ${plan.buttonClass}`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing and plans
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens after my free trial?
                </h3>
                <p className="text-gray-600">
                  After your 7-day free trial, you can choose to upgrade to a paid plan or continue with limited free usage.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I change my plan anytime?
                </h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit cards, PayPal, and bank transfers for enterprise customers.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a refund policy?
                </h3>
                <p className="text-gray-600">
                  Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do you offer discounts for annual billing?
                </h3>
                <p className="text-gray-600">
                  Yes, you can save 20% by choosing annual billing on any of our paid plans.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens to my files?
                </h3>
                <p className="text-gray-600">
                  Your files are automatically deleted after 30 days (90 days for Unlimited plan) for security and privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;