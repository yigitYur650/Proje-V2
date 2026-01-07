import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Customers() {
  const [customers, setCustomers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // --- 1. VERİLERİ ÇEK ---
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/customers");
        setCustomers(response.data);
      } catch (error) {
        console.error("Hata:", error);
      }
    };
    getData();
  }, []);

  // --- 2. FİLTRELEME ---
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // --- 3. YENİ MÜŞTERİ EKLE ---
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !phone) return alert("Lütfen isim ve telefon girin!");

    try {
      const newCustomer = { name: name, phone: phone, balance: 0, address: "" };
      const response = await axios.post("http://localhost:3000/api/customers", newCustomer);
      
      setCustomers([...customers, response.data]);
      setName("");
      setPhone("");
      alert("Müşteri eklendi! ✨");
    } catch (error) {
      console.error("Kayıt başarısız:", error);
      alert("Bir hata oluştu!");
    }
  };

  // --- 4. SİLME (Düzeltilen Yer Burası) ---
  const handleDeleteCustomer = async (id, customerName) => {
    if (!window.confirm(`${customerName} silinecek. Emin misin?`)) return;
    try {
      await axios.delete(`http://localhost:3000/api/customers/${id}`);
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (error) {
      // ARTIK ERROR DEĞİŞKENİNİ KULLANIYORUZ:
      console.error("Silme işlemi başarısız:", error); 
      alert("Silinemedi!");
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-light font-sans text-gray-800">
        
        {/* SOL MENÜ (ANTRASİT) */}
        <aside className="w-64 bg-brand-dark text-gray-400 flex flex-col shadow-xl">
            <div className="p-8 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-white tracking-wider text-center">
                    MODERN<br/><span className="text-brand-primary">PERDE</span>
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <Link to="/" className="flex items-center gap-3 hover:bg-white/10 px-4 py-3 rounded-lg transition text-gray-300 hover:text-white">
                    <span className="font-medium">🏛️ Ana Sayfa</span>
                </Link>
                <div className="px-4 py-3 bg-brand-primary rounded-lg text-white font-bold flex items-center gap-3 shadow-md">
                    <span>👥 Müşteriler</span>
                </div>
            </nav>
        </aside>

        {/* İÇERİK */}
        <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-brand-dark">Müşteri Listesi</h1>
                
                <div className="relative w-96">
                    <input 
                        type="text" 
                        placeholder="İsim veya Telefon Ara..." 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none shadow-sm transition bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="bg-white p-6 rounded-2xl shadow-lg h-fit border border-gray-100">
                    <h2 className="text-lg font-bold mb-6 text-brand-dark border-b pb-2">
                        Yeni Müşteri Ekle
                    </h2>
                    <form onSubmit={handleAdd}>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ad Soyad</label>
                            <input 
                                type="text" 
                                className="w-full bg-brand-light border border-gray-200 p-3 rounded-lg focus:bg-white focus:border-brand-primary outline-none transition"
                                placeholder="Örn: Ahmet Yılmaz"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Telefon</label>
                            <input 
                                type="text" 
                                className="w-full bg-brand-light border border-gray-200 p-3 rounded-lg focus:bg-white focus:border-brand-primary outline-none transition"
                                placeholder="0555..."
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="w-full bg-brand-dark text-white p-3 rounded-lg font-bold hover:bg-brand-primary transition shadow-md">
                            KAYDET
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2 flex justify-between">
                        <span>Kayıtlı Kişiler</span>
                        <span className="text-xs font-bold text-brand-primary bg-brand-light px-3 py-1 rounded-full">
                            {filteredCustomers.length} Müşteri
                        </span>
                    </h2>
                    
                    <ul className="space-y-3">
                        {filteredCustomers.map((customer) => (
                        <li key={customer.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:border-brand-primary/30 hover:shadow-md transition group bg-white">
                            <div className="flex-1">
                                <Link to={`/customers/${customer.id}`} className="font-bold text-lg text-brand-dark group-hover:text-brand-primary transition">
                                    {customer.name}
                                </Link>
                                <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                    📞 {customer.phone}
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 uppercase font-bold block">Bakiye</span>
                                    <span className={`font-bold text-lg ${customer.balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                        {customer.balance} ₺
                                    </span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                                    title="Sil"
                                >
                                    🗑️
                                </button>
                            </div>
                        </li>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <div className="text-center py-10 opacity-50">
                                <p className="text-4xl mb-2">🔍</p>
                                <p>Aradığınız kriterde müşteri bulunamadı.</p>
                            </div>
                        )}
                    </ul>
                </div>

            </div>
        </main>
    </div>
  );
}

export default Customers;