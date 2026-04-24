/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clay: {
          cream:        '#faf9f7',
          oat:          '#f0ece6',
          border:       '#dad4c8',
          silver:       '#9f9b93',
          charcoal:     '#333333',
          blue:         '#3b5fe2',
          'blue-light': '#eef1fd',
          'blue-mid':   '#c7d2fa',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        clay:      'rgba(0,0,0,0.10) 0px 1px 1px, rgba(0,0,0,0.04) 0px -1px 1px inset, rgba(0,0,0,0.05) 0px -0.5px 1px',
        'clay-md': 'rgba(0,0,0,0.12) 0px 4px 12px, rgba(0,0,0,0.04) 0px -1px 1px inset, rgba(0,0,0,0.06) 0px 1px 2px',
        'clay-nav':'rgba(0,0,0,0.06) 0px 1px 0px, rgba(0,0,0,0.03) 0px 2px 4px',
      },
      borderRadius: {
        'clay-card':    '16px',
        'clay-section': '40px',
      },
    },
  },
  plugins: [],
}
