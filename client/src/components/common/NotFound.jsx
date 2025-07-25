import { motion } from 'framer-motion';
import { ArrowRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-red-100 rounded-full opacity-75 blur"></div>
            <div className="relative bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-9xl font-bold text-red-500">404</div>
              <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Page Not Found</h1>
              <p className="mt-4 text-gray-600">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="group relative w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Go Home
            <span className="absolute right-4 group-hover:right-3 transition-all duration-200">
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="group relative w-full sm:w-auto flex justify-center py-3 px-6 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg"
          >
            Go Back
            <span className="absolute right-4 group-hover:right-3 transition-all duration-200">
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-gray-500 text-sm"
        >
          <p>Need help? Contact our support team</p>
          <a
            href="mailto:support@example.com"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            support@example.com
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;