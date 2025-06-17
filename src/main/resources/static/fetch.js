// Yeni XMLHttpRequest nesnesi oluşturuluyor
var xhr = new XMLHttpRequest();

// İstek başlatılıyor (POST metodunu seçiyoruz)
xhr.open("POST", "http://localhost:9191/api/v1/generate", true);

// Başlıkları ayarlıyoruz (Content-Type genellikle JSON ise 'application/json' olmalı)
xhr.setRequestHeader("Content-Type", "application/json");

// İstek tamamlandığında yapılacak işlem
xhr.onload = function() {
  if (xhr.status === 200) {
    // Başarılı yanıt (HTTP 200)
    console.log("Success:", xhr.responseText);
  } else {
    // Başarısız yanıt (örneğin, 400, 500 hataları)
    console.log("Error:", xhr.status, xhr.statusText);
  }
};

// Hata yakalama
xhr.onerror = function() {
  console.log("Request failed");
};

// Gönderilecek veri (JSON formatında)
var data = JSON.stringify({
  key: "value",
  anotherKey: "anotherValue"
});

// İstek gönderiliyor
xhr.send(data);