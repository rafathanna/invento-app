# InventoPro - Frontend

مشروع إدارة المخازن الاحترافي (React + TypeScript).

## المتطلبات المسبقة / Prerequisites
لأنك واجهت مشكلة في تشغيل أوامر `npx` أو `node`، يبدو أن **Node.js** غير مثبت لديك.
لتشغيل هذا المشروع، **يجب** تحميل وتثبيت Node.js من الموقع الرسمي:
[https://nodejs.org/](https://nodejs.org/)

## خطوات التشغيل / How to Run
بعد تثبيت Node.js، اتبع الخطوات التالية:

1. افتح موجه الأوامر (CMD/Terminal) داخل مجلد `invento-pro`.
   *تأكد أنك داخل المجلد:* `choose c:\Users\vip\OneDrive\Desktop\test\invento-pro`

2. قم بتثبيت المكتبات بتشغيل هذا الأمر:
   ```bash
   npm install
   ```
   *(انتظر حتى ينتهي التحميل)*

3. لتشغيل المشروع في وضع التطوير (Development Mode):
   ```bash
   npm run dev
   ```

4. سيظهر لك رابط (مثلاً `http://localhost:5173`)، افتحه في المتصفح لرؤية الموقع.

## هيكلة المشروع / Project Structure
- **src/pages**: صفحات الموقع (Dashboard, Customers, etc.)
- **src/layouts**: التخطيط الرئيسي (Sidebar, Header)
- **src/store**: إعدادات Redux State Management
- **src/components**: المكونات القابلة لإعادة الاستخدام (الأزرار، الجداول، إلخ - سنضيفها تباعاً)

تم تصميم المشروع ليدعم اللغة العربية (RTL) بشكل كامل وتلقائي.
