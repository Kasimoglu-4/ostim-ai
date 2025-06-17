# OSTIM.AI: YAPAY ZEKA DESTEKLİ SOHBET VE DOSYA İŞLEME PLATFORMU

---

## Kapak

**Proje Adı:** Ostim.AI: Yapay Zeka Destekli Sohbet ve Dosya İşleme Platformu  
**Hazırlayan:** Ömer Faruk Akın  
**Kurum/Bölüm:** OSTIM Teknik Üniversitesi - Bilgisayar Mühendisliği  
**Danışman:** Proje Sorumlusu  
**Tarih:** Aralık 2024

---

## Özet

Bu çalışma, Ostim.AI isimli, yapay zeka destekli sohbet ve dosya işleme platformunun tasarımını, geliştirilmesini ve değerlendirilmesini kapsamaktadır. Proje, modern yazılım mühendisliği ilkeleriyle, Spring Boot tabanlı bir arka uç ve React tabanlı bir ön yüz ile inşa edilmiştir. Kullanıcılar, platform üzerinden doğal dilde sohbet edebilmekte, çeşitli dosya formatlarını yükleyip analiz edebilmekte ve yapay zeka modellerinden faydalanabilmektedir. Sistem, güvenlik, ölçeklenebilirlik ve kullanıcı deneyimi açısından güncel teknolojilerle donatılmıştır. Bu rapor, projenin mimarisini, işlevselliğini, test ve kalite süreçlerini, karşılaşılan zorlukları ve gelecek geliştirme önerilerini detaylı biçimde sunmaktadır.

**Anahtar Kelimeler:** Yapay Zeka, Sohbet Uygulaması, Dosya Analizi, Spring Boot, React, JWT, Yazılım Mimarisi

---

## Abstract

This study covers the design, development, and evaluation of Ostim.AI, an AI-powered chat and file processing platform. The project is built with modern software engineering principles, featuring a Spring Boot backend and a React frontend. Users can chat in natural language, upload and analyze various file formats, and benefit from integrated AI models. The system is equipped with up-to-date technologies for security, scalability, and user experience. This report presents the architecture, functionality, testing and quality processes, encountered challenges, and future development suggestions in detail.

**Keywords:** Artificial Intelligence, Chat Application, File Analysis, Spring Boot, React, JWT, Software Architecture

---

## İçindekiler

1. Giriş  
2. Literatür Özeti ve Motivasyon  
3. Sistem Mimarisi  
4. Temel Özellikler ve Fonksiyonellikler  
5. Veritabanı Tasarımı  
6. Kullanıcı Arayüzü  
7. API ve Entegrasyonlar  
8. Güvenlik ve Test Süreçleri  
9. Performans ve Ölçeklenebilirlik  
10. Sonuç ve Gelecek Çalışmalar  
11. Kaynakça  
12. Ekler

---

## 1. Giriş

Yapay zeka tabanlı uygulamalar, günümüzde bilgi teknolojilerinin en hızlı gelişen alanlarından biridir. Özellikle doğal dil işleme ve dosya analizi gibi alanlarda, kullanıcıların ihtiyaçlarına hızlı ve akıllı çözümler sunmak büyük önem taşımaktadır. Ostim.AI projesi, bu gereksinimlere yanıt vermek amacıyla geliştirilmiş, kullanıcıların hem sohbet edebileceği hem de dosya yükleyip analiz edebileceği bütünleşik bir platformdur. Bu rapor, projenin teknik detaylarını ve geliştirme sürecini akademik bir bakış açısıyla sunmaktadır.

---

## 2. Literatür Özeti ve Motivasyon

Yapay zeka destekli sohbet uygulamaları ve dosya işleme sistemleri, son yıllarda hem akademik hem de endüstriyel alanda yaygınlaşmıştır. OpenAI, Google, Meta gibi şirketlerin sunduğu modeller, doğal dil işleme ve dosya analizi alanında önemli ilerlemeler sağlamıştır. Ancak, bu sistemlerin yerel olarak çalışabilen, güvenli ve özelleştirilebilir sürümlerine olan ihtiyaç devam etmektedir. Ostim.AI, bu boşluğu doldurmak üzere, açık kaynak teknolojiler ve yerel AI modelleriyle geliştirilmiştir.

---

## 3. Sistem Mimarisi

### 3.1 Genel Yapı

Ostim.AI, iki ana bileşenden oluşmaktadır:
- **Arka Uç (Backend):** Spring Boot 3.4.4, Java 21, MySQL/H2, Ollama LLM entegrasyonu
- **Ön Yüz (Frontend):** React 18, Material-UI, Axios, JWT tabanlı kimlik doğrulama

### 3.2 Katmanlı Mimari

- **Controller Katmanı:** REST API endpoint'leri
- **Service Katmanı:** İş mantığı ve entegrasyonlar
- **Repository Katmanı:** Veritabanı işlemleri (Spring Data JPA)
- **Model Katmanı:** Entity ve DTO sınıfları
- **Güvenlik Katmanı:** JWT, CORS, şifreleme
- **Konfigürasyon Katmanı:** Uygulama ayarları

### 3.3 Entegrasyonlar

- **Ollama LLM:** Yerel AI modeli ile doğal dil işleme
- **Apache Tika, PDFBox, POI:** Dosya formatı algılama ve metin çıkarma

---

## 4. Temel Özellikler ve Fonksiyonellikler

- **Kullanıcı Kimlik Doğrulama:** JWT tabanlı güvenli giriş/çıkış
- **Sohbet Yönetimi:** Çoklu sohbet, mesajlaşma, geçmiş görüntüleme
- **Dosya Yükleme ve Analiz:** PDF, Office, metin ve resim dosyaları desteği
- **Yapay Zeka Yanıtları:** Farklı AI modelleriyle sohbet ve dosya analizi
- **Oylama Sistemi:** Mesajlara oy verme ve geri bildirim
- **Sunucu İzleme:** AI sunucu sağlık kontrolü ve otomatik durum güncelleme

---

## 5. Veritabanı Tasarımı

- **Kullanıcı, Sohbet, Mesaj, Dosya, Oy** entity'leri
- **İlişkisel Model:** One-to-many ve many-to-one ilişkiler
- **ORM:** Hibernate/JPA ile otomatik şema yönetimi
- **Performans:** Indexleme, sayfalama, native sorgular

---

## 6. Kullanıcı Arayüzü

- **Modern ve Responsive Tasarım:** Material-UI, mobil uyumluluk
- **Chat ve Dosya Yükleme:** Sürükle-bırak, anlık mesajlaşma
- **Kullanıcı Deneyimi:** Otomatik kaydırma, hata yönetimi, tema desteği

---

## 7. API ve Entegrasyonlar

- **RESTful API:** Kimlik doğrulama, sohbet, mesaj, dosya, AI, oylama endpoint'leri
- **API Güvenliği:** JWT, CORS, input validation
- **Dış Servisler:** Ollama, dosya analiz servisleri

---

## 8. Güvenlik ve Test Süreçleri

- **Güvenlik:** JWT, şifre hash'leme, dosya tipi ve boyut kontrolü, XSS/SQL Injection önlemleri
- **Testler:** JUnit, Spring Boot Test, React Testing Library, E2E testler
- **CI/CD:** Otomatik test ve dağıtım pipeline'ı

---

## 9. Performans ve Ölçeklenebilirlik

- **Backend Performansı:** API yanıt süresi, dosya işleme hızı, AI yanıt süresi
- **Frontend Performansı:** FCP, LCP, CLS, FID metrikleri
- **Ölçeklenebilirlik:** Stateless mimari, containerization, cloud deployment

---

## 10. Sonuç ve Gelecek Çalışmalar

Ostim.AI, modern yazılım geliştirme standartlarına uygun, güvenli ve ölçeklenebilir bir yapay zeka platformu olarak başarıyla geliştirilmiştir. Gelecekte, gerçek zamanlı WebSocket tabanlı sohbet, mobil uygulama desteği, daha gelişmiş AI modelleri ve kurumsal entegrasyonlar planlanmaktadır.

---

## 11. Kaynakça

1. Spring Boot Documentation, https://spring.io/projects/spring-boot  
2. React Documentation, https://react.dev/  
3. Ollama Documentation, https://ollama.ai/  
4. Apache Tika, https://tika.apache.org/  
5. OWASP Top 10, https://owasp.org/www-project-top-ten/  
6. Robert C. Martin, Clean Architecture  
7. Eric Evans, Domain-Driven Design  
8. Scrum Guide, https://scrumguides.org/

---

## 12. Ekler

- Ek-1: Sistem mimarisi diyagramı  
- Ek-2: Örnek API çağrıları  
- Ek-3: Test senaryoları ve sonuçları

---

**Not:** Bu rapor, Ostim.AI projesinin akademik ve teknik analizini içermekte olup, ilgili alanlarda referans olarak kullanılabilir. 