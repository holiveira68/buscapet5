/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        terra:    { DEFAULT:'#C25B2A', light:'#E07B47', dark:'#8B3A18' },
        sage:     { DEFAULT:'#4A7C59', light:'#6BA580', dark:'#2F5439' },
        cream:    { DEFAULT:'#FAF5EC', dark:'#EDE5D0' },
        amber:    { DEFAULT:'#F5A623', light:'#FFD07A' },
        charcoal: { DEFAULT:'#1E1E1E', soft:'#5A5A5A' },
      },
      fontFamily: {
        display: ['"Playfair Display"','serif'],
        sans:    ['"DM Sans"','sans-serif'],
      },
      keyframes: {
        slideUp:     { from:{opacity:'0',transform:'translateY(24px)'},to:{opacity:'1',transform:'translateY(0)'} },
        fadeIn:      { from:{opacity:'0'},to:{opacity:'1'} },
        urgentPulse: { '0%,100%':{opacity:'1'},'50%':{opacity:'.6'} },
        matchPulse:  { '0%,100%':{transform:'scale(1)'},'50%':{transform:'scale(1.04)'} },
        toastIn:     { from:{opacity:'0',transform:'translateY(12px)'},to:{opacity:'1',transform:'translateY(0)'} },
      },
      animation: {
        'slide-up':    'slideUp .6s ease both',
        'fade-in':     'fadeIn .4s ease both',
        'pulse-slow':  'urgentPulse 1.8s ease infinite',
        'match':       'matchPulse 2s ease infinite',
        'toast-in':    'toastIn .3s ease both',
      },
    },
  },
  plugins: [],
};
