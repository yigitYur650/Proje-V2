import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function NewOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  
  // Başlangıçta 0 yerine boş hissettirecek mantık aşağıda
  const [items, setItems] = useState([
    { id: 1, room: "Salon", type: "tul", width: 0, height: 260, pile: 3, price: 0 }
  ]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/customers");
        setCustomers(res.data);
      } catch (err) {
        console.error("Müşteriler çekilemedi:", err);
      }
    };
    fetchCustomers();
  }, []);

  const addItem = () => {
    setItems([...items, { id: Date.now(), room: "", type: "tul", width: 0, height: 260, pile: 3, price: 0 }]);
  };

  const updateItem = (id, field, value) => {
    // Eğer kutu boşaltılırsa (silinirse) değeri 0 yap ki matematik bozulmasın
    const safeValue = value === "" ? 0 : value;

    const newItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: safeValue };
        
        let calculatedPrice = 0;
        // Hesaplama yaparken 0 olsa bile sorun olmaz
        const w = parseFloat(updatedItem.width) || 0;
        const h = parseFloat(updatedItem.height) || 0;
        const p = parseFloat(updatedItem.pile) || 0;

        if (updatedItem.type === "tul" || updatedItem.type === "fon") {
          calculatedPrice = (w / 100) * p * 150; 
        } else {
          calculatedPrice = (w / 100) * (h / 100) * 400; 
        }
        updatedItem.price = Math.round(calculatedPrice);
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const grandTotal = items.reduce((acc, item) => acc + item.price, 0);

  const handleSaveOrder = async () => {
    if (!selectedCustomerId) return alert("Lütfen bir müşteri seçin!");
    if (grandTotal === 0) return alert("Lütfen ürün girin!");

    const orderPayload = {
      customer_id: parseInt(selectedCustomerId),
      total_amount: grandTotal,
      note: "Mobil uygulama siparişi",
      items: items.map(item => ({
        room: item.room,
        type: item.type,
        width: parseFloat(item.width),
        height: parseFloat(item.height),
        pile: parseFloat(item.pile),
        price: parseFloat(item.price)
      }))
    };

    try {
      await axios.post("http://localhost:3000/api/orders", orderPayload);
      alert("Sipariş başarıyla kaydedildi! ✅");
      navigate("/customers"); 
    } catch (error) {
      console.error("Sipariş hatası:", error);
      alert("Kaydedilirken hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 font-sans text-slate-900">
      
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-slate-500 text-2xl hover:text-slate-800">←</Link>
        <h1 className="text-xl font-bold text-slate-800">Yeni Sipariş Oluştur</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4">
        <label className="block text-sm font-medium text-slate-600 mb-1">Müşteri Seçin</label>
        <select 
          className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          <option value="">Seçiniz...</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500 relative">
            <div className="absolute top-2 right-2 text-xs font-bold text-slate-300">#{index + 1}</div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-slate-500 font-bold">Oda Adı</label>
                <input 
                  type="text" 
                  placeholder="Örn: Salon"
                  className="w-full border-b border-slate-200 py-1 focus:outline-none focus:border-indigo-500 text-slate-700"
                  value={item.room}
                  onChange={(e) => updateItem(item.id, "room", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold">Perde Türü</label>
                <select 
                  className="w-full border-b border-slate-200 py-1 bg-transparent focus:outline-none text-slate-700"
                  value={item.type}
                  onChange={(e) => updateItem(item.id, "type", e.target.value)}
                >
                  <option value="tul">Tül Perde</option>
                  <option value="fon">Fon Perde</option>
                  <option value="stor">Stor / Zebra</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="text-xs text-slate-500">En (cm)</label>
                {/* İŞTE DÜZELTİLEN YER BURASI: 0 İSE BOŞ GÖSTER */}
                <input 
                  type="number" 
                  className="w-full bg-slate-50 p-2 rounded text-center font-bold text-slate-700 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200" 
                  value={item.width === 0 ? "" : item.width} 
                  onChange={(e) => updateItem(item.id, "width", e.target.value)} 
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Boy (cm)</label>
                 {/* İŞTE DÜZELTİLEN YER BURASI */}
                <input 
                  type="number" 
                  className="w-full bg-slate-50 p-2 rounded text-center text-slate-700 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200" 
                  value={item.height === 0 ? "" : item.height} 
                  onChange={(e) => updateItem(item.id, "height", e.target.value)} 
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Pile</label>
                <select className="w-full bg-slate-50 p-2 rounded text-center text-slate-700 border border-slate-200"
                   value={item.pile} onChange={(e) => updateItem(item.id, "pile", Number(e.target.value))}>
                  <option value="2">1'e 2</option>
                  <option value="2.5">1'e 2.5</option>
                  <option value="3">1'e 3</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
              <span className="text-sm text-slate-400">Tahmini Tutar:</span>
              <span className="text-lg font-bold text-emerald-600">{item.price} ₺</span>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addItem} className="w-full py-3 mt-4 border-2 border-dashed border-slate-300 text-slate-400 rounded-lg hover:bg-slate-50 hover:text-slate-600 font-medium transition">
        + Başka Oda Ekle
      </button>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-lg flex justify-between items-center z-10">
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase">Genel Toplam</p>
          <p className="text-2xl font-bold text-indigo-900">{grandTotal} ₺</p>
        </div>
        <button 
          onClick={handleSaveOrder}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95"
        >
          SİPARİŞİ ONAYLA
        </button>
      </div>

    </div>
  );
}

export default NewOrder;