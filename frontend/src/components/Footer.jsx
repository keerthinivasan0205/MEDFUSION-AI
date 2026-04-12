import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-blue-600 font-semibold">
          <Activity className="w-5 h-5" />
          MEDFUSION AI
        </div>
        <p className="text-sm text-gray-400">AI-Powered Multi-Disease Diagnosis System</p>
        <p className="text-sm text-gray-400">© {new Date().getFullYear()} MedFusion. All rights reserved.</p>
      </div>
    </footer>
  );
}
