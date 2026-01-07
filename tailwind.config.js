/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          dark: '#2c3e50',     // Koyu Antrasit (Menü ve Başlıklar) - Ciddiyet
          primary: '#a68b6c',  // Vizon (Butonlar ve Vurgular) - Perde hissi
          primaryHover: '#8c7356', // Butona gelince koyulaşan vizon
          light: '#f3f4f6',    // Çok açık gri (Zemin)
          white: '#ffffff',    // Kartlar
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'], // Okunaklı modern font
      }
    },
  },
  plugins: [],
}