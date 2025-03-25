/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'legal-red': {
                    DEFAULT: '#D32F2F',
                    50: '#FFCDD2',
                    100: '#F44336',
                    700: '#D32F2F',
                },
                'legal-gray': {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    200: '#EEEEEE',
                    300: '#E0E0E0',
                    400: '#BDBDBD',
                }
            },
            boxShadow: {
                'chat-input': '0 -2px 4px rgba(0,0,0,0.1)',
                'sidebar': '2px 0 5px rgba(0,0,0,0.1)'
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-in': 'slideIn 0.3s ease-out'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' }
                }
            }
        },
    },
    plugins: [],
}