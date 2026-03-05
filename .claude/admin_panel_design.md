# 🏗️ BayRechnung: İnşaat Yönetimi & Admin Paneli Tasarım Spesifikasyonu

Bu doküman, İşveren/Admin kullanıcısının tüm firmayı ve şantiyeleri tek ekrandan yönetebileceği sade ve güçlü Admin paneli akışını tanımlar.

---

## 1. Ekran: Kullanıcı Yönetimi (Ekip & Roller)
**Amaç:** Personel yetkilendirme, şantiye atama ve aktif kullanıcı takibi.

*   **Ana Bileşenler:**
    *   **Çalışan Listesi Grid:** Personel adı, e-posta, mevcut rolü ve durumu (aktif/pasif).
    *   **Şantiye Atama Kolonu:** Her çalışanın hangi projelere erişimi olduğunun görsel özeti.
    *   **Arama & Filtre:** Uzmanlık alanına (Mimar, Mühendis, Formen) veya projeye göre hızlı bulma.
    *   **Rol Düzenleme Modalı:** Yeni rol atama ve yetki seviyesi (Admin, Standart, Worker).
*   **MVP (Zorunlu) Alanlar:** Ad-Soyad, E-posta, Rol (Enum), Atanan Şantiyeler.
*   **İleri Seviye (Opsiyonel):** Puantaj entegrasyonu, İşe giriş tarihi, Personel maliyet verisi.

---

## 2. Ekran: Raporlar Arşivi
**Amaç:** Şantiyelerden gelen verilerin merkezi olarak izlenmesi ve analizi.

*   **Ana Bileşenler:**
    *   **Rapor Tipi Kategorileri:** Günlük Faaliyet, Gelir-Gider, Stok, İlerleme raporları için sekmeler.
    *   **Tarih Aralığı Filtresi:** Belirli bir döneme ait tüm raporların çekilmesi.
    *   **Önizleme Kartları:** Raporun küçük bir özeti ve onay durumu.
    *   **PDF/Excel Export:** Raporların resmi yazışmalar için dışa aktarılması.
*   **MVP (Zorunlu) Alanlar:** Rapor Tipi, Tarih, Yükleyen, İçerik Özeti.
*   **İleri Seviye (Opsiyonel):** Hava durumu entegrasyonu, Fotoğraf galerisi (Şantiyeden anlık kareler).

---

## 3. Ekran: Finans Dashboard
**Amaç:** Firmanın genel mali durumunu anlık olarak görmesi.

*   **Ana Bileşenler:**
    *   **KPI Kartları:** Toplam Ciro, Bekleyen Ödemeler, Toplam Gider, Kâr Oranı.
    *   **Gider Dağılım Grafiği (Donut/Pie):** Malzeme, İşçilik, Akaryakıt, Yan Giderler.
    *   **Nakit Akış Trendi (Area Chart):** Aylık bazda gelir-gider dengesi.
*   **MVP (Zorunlu) Alanlar:** Toplam Gelir, Toplam Gider, Proje Bazlı Maliyet.
*   **İleri Seviye (Opsiyonel):** KDV iade takibi, Banka entegrasyonu, Fatura vadesi uyarıları.

---

## 4. Ekran: Şantiye ve İş Akışı
**Amaç:** Projelerin fiziksel ilerleme durumunu takip etme.

*   **Ana Bileşenler:**
    *   **Kanban Görünümü:** Aşamalar (Planlama -> Temel -> Kaba İnşaat -> İnce İş -> Teslim).
    *   **İlerleme Barı:** Her şantiye için % cinsinden tamamlanma oranı.
    *   **Gantt Çizelgesi (Basit):** Kritik yolların ve gecikmiş görevlerin görsel takibi.
*   **MVP (Zorunlu) Alanlar:** Şantiye Adı, Sorumlu Şef, İlerleme %, Hedef Bitiş Tarihi.
*   **İleri Seviye (Opsiyonel):** Drone/CCTV entegrasyonu, Taşeron performans puanlaması.

---

## 5. Ekran: Mesajlar / Bildirimler
**Amaç:** Üst düzey yönetim ile şantiye operasyonları arasındaki iletişim.

*   **Ana Bileşenler:**
    *   **Acil Durum Bildirimleri:** Kırmızı uyarılar (İş kazası bildirimi, kritik stok bitişi).
    *   **Yönetici Notları:** Adminin belirli bir şantiyeye veya kişiye bıraktığı talimatlar.
    *   **Öneri Kutusu:** Sahadaki personelden gelen operasyonel verimlilik önerileri.
*   **MVP (Zorunlu) Alanlar:** Mesaj Başlığı, İçerik, Gönderen, Okundu Durumu.
*   **İleri Seviye (Opsiyonel):** Slack/WhatsApp Entegrasyonu, Sesli Not desteği.

---
*Bu tasarım BayRechnung altyapısı ile teknik olarak uyumludur ve Supabase tabloları (users, company_settings, invoices, projects, messages) üzerinden beslenir.*
