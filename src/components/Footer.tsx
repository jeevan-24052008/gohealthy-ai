import { Link } from 'react-router-dom';
import { Activity, Mail, Globe, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Symptom Checker', path: '/symptom-checker' },
    { label: 'Health Score', path: '/health-score' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'About', path: '/about' },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">GoHealthy AI</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your intelligent health companion powered by AI. Get instant symptom
              analysis, personalized recommendations, and track your wellness journey.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Designed for your wellbeing</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@gohealthy.ai</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Globe className="w-4 h-4" />
                <span>www.gohealthy.ai</span>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-300">Medical Disclaimer:</strong> This
                service is for informational purposes only and does not replace
                professional medical advice.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} GoHealthy AI. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm flex items-center">
              Made with{' '}
              <Heart className="w-4 h-4 mx-1 text-rose-500 fill-rose-500" /> by the
              GoHealthy Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
