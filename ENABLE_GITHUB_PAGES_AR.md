# تفعيل رابط سياسة الخصوصية — خطوات الناشر

ملف السياسة موجود في `docs/privacy-policy-ar.html`، وسير العمل موجود في `.github/workflows/deploy-privacy-policy.yml`. لم يتمكّن سير العمل من إنشاء موقع Pages تلقائيًا بسبب صلاحيات المستودع، لذلك يجب على مالك المستودع تفعيل Pages مرة واحدة.

1. افتح مستودع GitHub: https://github.com/akramzayed222-ship-it/-
2. اختر **Settings → Pages**.
3. في قسم **Build and deployment**، اختر **GitHub Actions** كمصدر النشر (وليس Deploy from a branch).
4. افتح **Actions → Publish AL-MOFEED Privacy Policy**، واختر **Run workflow** على فرع `fix/android-mobile-font-math-test` بعد التأكد من أن صفحة السياسة تتضمن البريد والرقم الصحيحين.
5. انتظر انتهاء النشر بنجاح، ثم افتح في نافذة خاصة/متصفح غير مسجّل الدخول: https://akramzayed222-ship-it.github.io/-/privacy-policy-ar.html
6. لا تستخدم الرابط في Play Console ولا تعتبره منشورًا حتى تظهر الصفحة كاملة عبر HTTPS من دون تسجيل دخول.
7. بعد نشر سياسة الخصوصية والتأكد من عملها، أعد بناء نسخة Android وراجع رابط السياسة داخل التطبيق في اختبار فعلي قبل إرسال الإصدار للمتجر.

## ملاحظة
فشل التشغيل الأول لأن GitHub رفض إنشاء Pages site من رمز سير العمل: `Resource not accessible by integration`. هذا لا يدل على خلل في نص السياسة؛ المطلوب هو تفعيل GitHub Pages من إعدادات المالك. لا يحتوي هذا المشروع على مفتاح أو بيانات دخول إلى Play Console.
