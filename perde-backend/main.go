package main

import (
	"fmt"
	"log"
	"strings" // <-- BUNU MUTLAKA EKLE! (Temizlik robotu bu)
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// --- 1. VERİTABANI MODELLERİ ---

type Customer struct {
	ID      uint    `json:"id" gorm:"primaryKey"`
	Name    string  `json:"name"`
	Phone   string  `json:"phone" gorm:"unique"`
	Address string  `json:"address"`
	Balance float64 `json:"balance"`
	Orders  []Order `json:"orders" gorm:"foreignKey:CustomerID"`
}

// Sipariş Tablosu (Ana Fiş)
type Order struct {
	ID          uint        `json:"id" gorm:"primaryKey"`
	CustomerID  uint        `json:"customer_id"`                     // Hangi müşterinin?
	TotalAmount float64     `json:"total_amount"`                    // Toplam Tutar
	Note        string      `json:"note"`                            // Ek notlar
	CreatedAt   time.Time   `json:"created_at"`                      // Sipariş Tarihi
	Items       []OrderItem `json:"items" gorm:"foreignKey:OrderID"` // Siparişin içindeki perdeler
}

// Sipariş Kalemleri (Perdeler)
type OrderItem struct {
	ID      uint    `json:"id" gorm:"primaryKey"`
	OrderID uint    `json:"order_id"`
	Room    string  `json:"room"`   // Oda (Salon, Mutfak)
	Type    string  `json:"type"`   // Tül, Stor
	Width   float64 `json:"width"`  // En
	Height  float64 `json:"height"` // Boy
	Pile    float64 `json:"pile"`   // Pile Sıklığı
	Price   float64 `json:"price"`  // O perdenin fiyatı
}

var DB *gorm.DB

func ConnectDB() {
	var err error
	dsn := "host=localhost user=postgres password=12345 dbname=perde_db port=5433 sslmode=disable"

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Veritabanı Hatası:", err)
	}
	fmt.Println("🚀 Veritabanı Bağlantısı Başarılı!")

	// --- DİKKAT: BU SATIRI EKLE ---
	// Bu satır eski tabloyu siler. Bir kere çalıştırdıktan sonra sileceğiz.
	DB.Migrator().DropTable(&Customer{})
	// ------------------------------

	DB.AutoMigrate(&Customer{}, &Order{}, &OrderItem{})
	fmt.Println("✅ Tablolar SIFIRDAN Hazırlandı (Unique Kuralı Eklendi)")
}
func main() {
	ConnectDB()
	app := fiber.New()
	app.Use(cors.New())

	// --- API ROTALARI ---

	// 1. Müşterileri Getir
	app.Get("/api/customers", func(c *fiber.Ctx) error {
		var customers []Customer
		DB.Find(&customers)
		return c.JSON(customers)
	})

	// 2. Yeni Müşteri Ekle
	app.Post("/api/customers", func(c *fiber.Ctx) error {
		customer := new(Customer)
		if err := c.BodyParser(customer); err != nil {
			return c.Status(400).SendString(err.Error())
		}
		DB.Create(&customer)
		return c.JSON(customer)
	})

	// 3. SİPARİŞ KAYDETME (Yeni Özellik)
	app.Post("/api/orders", func(c *fiber.Ctx) error {
		order := new(Order)

		// Frontend'den gelen veriyi oku
		if err := c.BodyParser(order); err != nil {
			return c.Status(400).SendString(err.Error())
		}

		// Sipariş tarihini şimdi olarak ayarla
		order.CreatedAt = time.Now()

		// Veritabanına kaydet (GORM kalemleri de otomatik kaydeder)
		result := DB.Create(&order)
		if result.Error != nil {
			return c.Status(500).SendString("Sipariş kaydedilemedi")
		}

		// Müşterinin bakiyesini (borcunu) güncelle
		var customer Customer
		if err := DB.First(&customer, order.CustomerID).Error; err == nil {
			customer.Balance += order.TotalAmount
			DB.Save(&customer)
		}

		return c.JSON(order)
	})
	// --- BU KODU MAIN FONKSIYONUNUN İÇİNE, DİĞER ROTALARIN ALTINA EKLE ---

	// 4. Müşteri Detayını Getir (Sipariş Geçmişiyle Birlikte)
	// 2. Yeni Müşteri Ekle (GÜNCELLENDİ: Telefon Kontrolü Eklendi)
	// 2. Yeni Müşteri Ekle (GARANTİLİ VERSİYON)
	app.Post("/api/customers", func(c *fiber.Ctx) error {
		customer := new(Customer)

		if err := c.BodyParser(customer); err != nil {
			return c.Status(400).SendString(err.Error())
		}

		// --- 1. TEMİZLİK ROBOTU ---
		// Telefon numarasındaki boşlukları (-) ve parantezleri temizle
		// Örn: "0 (555) 123 44" -> "055512344" olur.
		cleanPhone := strings.ReplaceAll(customer.Phone, " ", "")
		cleanPhone = strings.ReplaceAll(cleanPhone, "-", "")
		cleanPhone = strings.ReplaceAll(cleanPhone, "(", "")
		cleanPhone = strings.ReplaceAll(cleanPhone, ")", "")

		// Temizlenmiş numarayı müşteriye geri yükle
		customer.Phone = cleanPhone

		// Terminale yazdıralım ki çalıştığını gör (Log)
		fmt.Println("🔍 KONTROL EDİLİYOR: ", cleanPhone)

		// --- 2. ÇAKIŞMA KONTROLÜ ---
		var existingCustomer Customer
		// Veritabanında bu temiz numarayı ara
		result := DB.Where("phone = ?", cleanPhone).First(&existingCustomer)

		// Eğer RowsAffected > 0 ise, kayıt bulundu demektir.
		if result.RowsAffected > 0 {
			fmt.Println("❌ BU NUMARA ZATEN VAR ID:", existingCustomer.ID)
			return c.Status(409).JSON(fiber.Map{
				"error": "Bu telefon numarası zaten sistemde kayıtlı!",
			})
		}

		// Kayıt yoksa ekle
		DB.Create(&customer)
		fmt.Println("✅ YENİ MÜŞTERİ EKLENDİ:", customer.Name)
		return c.JSON(customer)
	})
	// --- YENİ EKLENECEK KISIM (ÖDEME/TAHSİLAT) ---
	app.Post("/api/payments", func(c *fiber.Ctx) error {
		// 1. Gelen veriyi (Müşteri ID ve Tutar) karşıla
		type PaymentRequest struct {
			CustomerID uint    `json:"customer_id"`
			Amount     float64 `json:"amount"`
		}

		payment := new(PaymentRequest)
		if err := c.BodyParser(payment); err != nil {
			return c.Status(400).SendString("Hatalı veri!")
		}

		// 2. Müşteriyi Bul
		var customer Customer
		if err := DB.First(&customer, payment.CustomerID).Error; err != nil {
			return c.Status(404).SendString("Müşteri bulunamadı")
		}

		// 3. Borçtan Düş (Tahsilat işlemi)
		customer.Balance -= payment.Amount
		DB.Save(&customer)

		// 4. Müşterinin son halini geri gönder
		return c.JSON(customer)
	})
	// --- SİLME İŞLEMLERİ (DELETE) ---

	// 6. Müşteriyi Sil (Siparişleriyle Birlikte)
	app.Delete("/api/customers/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var customer Customer

		// Önce müşteriyi bul
		if err := DB.First(&customer, id).Error; err != nil {
			return c.Status(404).SendString("Müşteri bulunamadı")
		}

		// GORM'da ilişkili verileri (Orders) silmek için özel bir ayar gerekir
		// Ama şimdilik basitçe önce siparişleri, sonra müşteriyi silelim:
		DB.Where("customer_id = ?", id).Delete(&Order{}) // Siparişlerini sil
		DB.Delete(&customer)                             // Kendisini sil

		return c.SendString("Müşteri ve siparişleri silindi")
	})

	// 7. Siparişi Sil (Ve Borçtan Düş)
	app.Delete("/api/orders/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var order Order

		// Önce siparişi bul (Tutarı lazım çünkü)
		if err := DB.First(&order, id).Error; err != nil {
			return c.Status(404).SendString("Sipariş bulunamadı")
		}

		// Müşteriyi bul ve parasını iade et (Borçtan düş)
		var customer Customer
		if err := DB.First(&customer, order.CustomerID).Error; err == nil {
			customer.Balance -= order.TotalAmount
			DB.Save(&customer)
		}

		// Şimdi siparişi veritabanından uçur
		// Önce kalemlerini (Items) sil
		DB.Where("order_id = ?", id).Delete(&OrderItem{})
		// Sonra fişin kendisini sil
		DB.Delete(&order)

		return c.SendString("Sipariş silindi ve bakiye güncellendi")
	})
	// ---------------------------------------------

	log.Fatal(app.Listen(":3000"))

}
