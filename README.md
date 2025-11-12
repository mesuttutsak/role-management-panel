# Role Management Panel

React 19, Redux Toolkit, Tailwind CSS ve Headless UI üzerinde kurulu; kullanıcıları paginated tabloda listeler, CRUD akışlarını destekler ve json-server üzerinden gelen rol-izin bilgilerini yönetir.

## 1. Proje Özeti
- **Senaryo**: Yöneticiler güvenli bir dashboard üzerinden Admin/Doctor/Patient rollerini ve izinlerini yönetir, kullanıcı CRUD + filtreleme yapar (`/dashbord`).
- **Teknoloji**: React 19 + React Router, Redux Toolkit, Tailwind CSS + CSS Modules, Headless UI, TanStack Table, json-server.
- **Kapsam**: Kullanıcı CRUD ve filtreleme, rol izin editörü, izin farkındalıklı oturum yönetimi.

## 2. Kurulum & Çalıştırma
1. Bağımlılıkları yükle  
   ```bash
   npm install
   ```
2. Mock API’yi çalıştır  
   ```bash
   npm run mock:server   # http://localhost:3001
   ```
   - İstersen `.env.local` içine `MOCK_SERVER_PORT=4002` yazıp `npm run mock:server` ile portu değiştirebilirsin (script bu değeri okuyor).
3. Frontend’i başlat  
   ```bash
   npm start             # http://localhost:3000
   ```
4. Prod derleme  
   ```bash
   npm run build
   ```

### Ortam değişkenleri
- React tarafında kullanılan değerler `REACT_APP_` ile başlar. Örnek `.env`:
  ```
  REACT_APP_API_BASE_URL=http://localhost:4001
  REACT_APP_SESSION_KEY=localLoggedUser
  REACT_APP_SESSION_DURATION_MS=3600000
  ```
- `src/config/index.js` bu env değerlerini okur; `.env.local` dosyasını repo dışında tutabilirsin.

### Giriş bilgisi
- Varsayılan admin: `admin / 1234` (json-server seed).
- Diğer kullanıcılar `db.json` içinde.

### Mock API hakkında
- JSON verileri `db.json` dosyasından okunur; bu dosyayı güncellediğinde mock-server’ı yeniden başlatman gerekir.
- `mock-server.js` role/permission guard’larını içerir (dup username, sistem kullanıcısı silmeme vb.).

## 3. Mimari
### 3.1 Klasör yapısı
```
src/
  app/            # redux store + hook'lar
  core/           # tekrar kullanılabilir UI + layout + util
  features/       # domain slice'ları (auth, users, roles, ...)
  pages/          # route seviyesindeki görünümler (login, dashboard/*)
  routes/         # router tanımları
  config/         # sabitler ve env alınan değerler
```
- **Component/Hook isimleri**: React component'leri PascalCase (`UsersPage`), hook/util'ler camelCase (`useRolePermissions`).
- **Stil**: CSS Module + Tailwind `@apply`; her component yanına `.module.css`.
- **Import**: `core/ui/*/index.js` içinde barrel export. `alias` kullanımını bilerek dahil etmedim proje üzerinde yeni dahil edilen modüller ve teknolojilerde ekstra geliştrme ihtiyacından kaynaklı birden aksamalar meydana getiriyor. 1'den fazla kişiden oluşan ekiplerde hız kaybına sebebiyet veriyor.
- **Commit**: Kısa prefix'ler (`feat:`, `refactor:`) ve küçük parçalar halinde commit. bknz: `<statu>: message`

### 3.2 State yönetimi
- Redux Toolkit slice bazlı mimari (`features/users/usersSlice.js`).
- Async thunk + selector'lar API/paginasyon akışını yönetir.
- `useUsersTable`, `useRolePermissions` gibi hook'lar slice + UI arasındaki case'leri yönetir.

### 3.3 UI sistemi
- Layout'lar: `AuthLayout` ve `DashboardLayout`.
- `core/ui` altında common componentler ve Headless UI sarıcıları (Button, Input, Modal, PaginatedTable...).
- Tailwind config özel renk + tipografi seti içerir.

### 3.4 Route mimarisi
- Tüm route tanımları `src/routes/routeList.js` içinde; lazy-loaded component + permission tanımları tek noktadan yönetiliyor.
- `RequireAuth` ve `SessionRedirect` guard bileşenleri login akışını kontrol ediyor.
- `/dashbord` altında `DashboardShell` layout'u render alıp `Outlet` aracılığıyla alt sayfaları besliyor.
- Users sayfası `src/pages/dashboard/users/UsersPage.jsx`, create/edit modalları aynı klasördeki route bileşenleri (`UsersCreateRoute`, `UsersEditRoute`) üzerinden URL tabanlı açılıyor.
- Roles, Overview gibi diğer sayfalar da `pages/dashboard/*` altında yer alıyor; Headless UI layout bileşenleri üzerinden aynı shell'e oturuyorlar.

### 3.5 Auth + Session mekanizması
- `features/auth/authSlice.js` login thunk'u json-server `/auth/login` endpoint'ine POST atıyor; gelen kullanıcı bilgisi ve permissionGroups state'e yazılıyor.
- Başarılı login'de kullanıcı `core/utils/session` içindeki localStorage tabanlı session manager ile `loggedUser` key ile  tutuluyor; süre `config/index.js` üzerinden belirlenen 30 dk.
- Sayfa yenilemelerinde `storedUser` state'e preload ediliyor. Logout tüm session state'ini temizliyor.
- Route guard'lar (`RequireAuth`, `SessionRedirect`) `auth.user` state'ini okuyup login'e yönlendiriyor veya dashboard'a taşıyor.
- Menü ve sayfa erişimleri `useHasPermission` hook'u ile kullanıcıdaki permissionGroups'a göre dinamik olarak kısıtlanıyor.

### 3.6 Paginated stratejisi
- `useUsersTable` sayfa değişiminde iki fetch'i paralel koşturuyor:
  1. `fetchUsers` → seçili sayfanın kayıtları dönüyor. Ve bir sonraki sayfa değer olduğunu `hasMore` parametresi ile boolean dönüyor. Böylece Count isteği tamamlanmadan prev/next yapabiliyoruz.
  2. `fetchUsersTotalCount` → sadece filter'ı baz alarak (hiç olmayadabilir) sadece toplam kayıt sayısını dönüyor. 
- İki isteği `Promise.all` ile tetikleyerek büyük listelerde `count` hesaplamasının tek isteği yavaşlatmasının önüne geçiliyor.
- json-server da `_page`/`_limit` parametreleri json-server'a uyumlu şekilde istek atılmıştır. 

## 4. Geliştirilebilecekler
- Permission kaynaklı `disabled` olan alanlarda poup ve veya tooltip ile bilgilendirme.
- Rol editöründe toplu rol oluşturma.
- alert'ler yerine dialog component eklenemesi.
- Proje core'un Redux state management kullanacak generic notification yazılmaıs
- PaginatedTable'ın List sayfalarını yönetmek için yazılmış generic bir hook fetch metodu ve use case'lerini kendi içinde gerçekleştirebilmesi. Prop drilling ile veri yönetime zorunluluğu oratadan kaldırır.

## 5. Efor & İletişim
- Yaklaşık **28 saat** (backend(json-server) + frontend(react) düzenlemeleri dahil).
- Mesut Tutsak — `ttsk.mesut@gmail.com` - `+90 0536 563 31 46`.
