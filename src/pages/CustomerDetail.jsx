import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  // Verileri Çeken Fonksiyon
  const fetchCustomerData = () => {
    axios.get(`http://localhost:3000/api/customers/${id}`)
      .then(res => setCustomer(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  // --- ÖDEME ALMA İŞLEMİ ---
  const handlePayment = async () => {
    const amountStr = prompt("Tahsil edilecek tutarı girin (TL):");
    if (!amountStr) return; 
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("Lütfen geçerli bir sayı girin!");

    try {
      await axios.post("http://localhost:3000/api/payments", {
        customer_id: parseInt(id),
        amount: amount
      });
      alert("Tahsilat yapıldı! 💸");
      fetchCustomerData(); 
    } catch (error) {
      console.error("Ödeme hatası:", error);
      alert("İşlem başarısız oldu!");
    }
  };

  // --- WHATSAPP İŞLEMİ ---
  const sendWhatsapp = () => {
    if(!customer) return;
    let phone = customer.phone.replace(/\s/g, '').replace(/^0/, '');
    const message = `Sayın ${customer.name}, perdecinizden hatırlatma. Toplam ${customer.balance} TL bakiyeniz bulunmaktadır. İyi günler dileriz.`;
    const url = `https://wa.me/90${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // --- SİPARİŞ SİLME / İPTAL ETME ---
  const handleDeleteOrder = async (orderId) => {
    if(!window.confirm("Bu siparişi iptal etmek istediğine emin misin? Tutar bakiyeden düşülecek.")) return;

    try {
        await axios.delete(`http://localhost:3000/api/orders/${orderId}`);
        alert("Sipariş iptal edildi. ✅");
        fetchCustomerData(); // Bakiyeyi ve listeyi güncelle
    } catch (error) {
        console.error("Silme hatası", error);
        alert("Sipariş silinemedi.");
    }
  };

  if (!customer) return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8 pb-24">
      
      {/* BAŞLIK */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/customers" className="text-slate-500 hover:text-slate-800 text-xl font-bold">← Geri</Link>
        <h1 className="text-2xl font-bold text-slate-800">Müşteri Detayı</h1>
      </div>

      {/* MÜŞTERİ KARTI */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">{customer.name}</h2>
            <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium">
                📞 {customer.phone}
            </p>
        </div>
        
        <div className="text-right w-full md:w-auto">
            <p className="text-sm text-slate-500 uppercase font-bold">Güncel Bakiye</p>
            <p className={`text-4xl font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {customer.balance} ₺
            </p>
            
            <div className="mt-4 flex gap-2 justify-end">
                <button 
                    onClick={handlePayment}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded shadow hover:bg-emerald-700 transition font-bold"
                >
                    💸 Ödeme Al
                </button>
                <button 
                    onClick={sendWhatsapp}
                    className="bg-green-500 text-white px-6 py-2.5 rounded shadow hover:bg-green-600 transition font-bold flex items-center gap-2"
                >
                   💬 WhatsApp
                </button>
            </div>
        </div>
      </div>

      {/* SİPARİŞ GEÇMİŞİ */}
      <h3 className="text-xl font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Sipariş Geçmişi</h3>
      
      <div className="space-y-6">
        {customer.orders && customer.orders.length > 0 ? (
            customer.orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Sipariş Başlığı */}
                    <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-700">Sipariş #{order.id}</span>
                            
                            {/* İŞTE SİLME BUTONU BURADA */}
                            <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold hover:bg-red-600 hover:text-white transition"
                            >
                                İptal Et ✕
                            </button>
                        </div>

                        <div className="text-right">
                            <span className="text-slate-500 text-sm block">
                                {new Date(order.created_at).toLocaleDateString('tr-TR')}
                            </span>
                            <span className="font-bold text-slate-800 text-lg">{order.total_amount} ₺</span>
                        </div>
                    </div>

                    {/* Sipariş Kalemleri */}
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2">Oda</th>
                                    <th className="px-4 py-2">Tür</th>
                                    <th className="px-4 py-2">Ölçü</th>
                                    <th className="px-4 py-2 text-right">Fiyat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{item.room}</td>
                                        <td className="px-4 py-3 capitalize">
                                            {item.type === 'tul' ? 'Tül' : item.type === 'stor' ? 'Stor' : item.type}
                                        </td>
                                        <td className="px-4 py-3">{item.width} x {item.height}</td>
                                        <td className="px-4 py-3 font-bold text-slate-700 text-right">{item.price} ₺</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Bu müşterinin henüz sipariş kaydı yok.</p>
                <Link to="/new-order" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">
                    + Yeni Sipariş Oluştur
                </Link>
            </div>
        )}
      </div>

    </div>
  );
}

export default CustomerDetail;