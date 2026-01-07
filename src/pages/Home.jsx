import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Home() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalReceivables: 0, 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/customers");
        const customers = res.data;
        const totalMoney = customers.reduce((acc, curr) => acc + curr.balance, 0);
        
        setStats({
          totalCustomers: customers.length,
          totalReceivables: totalMoney
        });
      } catch (error) {
        console.error("Veri çekilemedi", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-light font-sans text-gray-800 flex flex-col">
      
      {/* ÜST LOGO ALANI (ANTRASİT) */}
      <div className="bg-brand-dark text-white p-10 pb-16 rounded-b-[3rem] shadow-lg">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">PERDE SİSTEM</h1>
                <p className="text-brand-primary text-sm mt-1 font-medium">Hoşgeldin Patron 👋</p>
            </div>
        </div>

        {/* ÖZET KARTLARI */}
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                <p className="text-gray-300 text-xs font-bold uppercase mb-1 tracking-wider">Toplam Alacak</p>
                <p className="text-3xl font-bold text-white">{stats.totalReceivables} ₺</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                <p className="text-gray-300 text-xs font-bold uppercase mb-1 tracking-wider">Müşteri Sayısı</p>
                <p className="text-3xl font-bold text-white">{stats.totalCustomers}</p>
            </div>
        </div>
      </div>

      {/* HIZLI MENÜ */}
      <div className="flex-1 px-8 -mt-10">
        <div className="grid grid-cols-2 gap-6">
            
            <Link to="/new-order" className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 transition duration-300 group">
                <div className="bg-brand-light text-brand-dark w-16 h-16 rounded-full flex items-center justify-center text-3xl group-hover:bg-brand-primary group-hover:text-white transition duration-300">
                    📐
                </div>
                <span className="font-bold text-gray-700 text-lg">Yeni Sipariş</span>
            </Link>

            <Link to="/customers" className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 transition duration-300 group">
                <div className="bg-brand-light text-brand-dark w-16 h-16 rounded-full flex items-center justify-center text-3xl group-hover:bg-brand-primary group-hover:text-white transition duration-300">
                    👥
                </div>
                <span className="font-bold text-gray-700 text-lg">Müşteriler</span>
            </Link>

        </div>

        <div className="mt-12 text-center">
            <p className="text-gray-400 text-xs font-medium">© 2026 Perde Takip Sistemi v2.0</p>
        </div>
      </div>

    </div>
  );
}

export default Home;