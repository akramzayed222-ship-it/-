# المفيد في الرياضيات — تطبيق Android 4.1.5

## هوية إصدار العمل
- اسم التطبيق: المفيد - تحدي القوى والجذور
- حزمة Android: `com.almofeed.math`
- الإصدار: `versionName 4.1.5`, `versionCode 10`
- `compileSdk / targetSdk = 36 / 36`
- حالة النشر: مرشح إصدار فقط؛ لم يُنشر بعد إلى Google Play.
- حالة اختبار الجهاز: لم يتم توثيق اختبار على هاتف Android فعلي بعد.

## الإصدار الرياضي
- يتضمن التحدي 20 سؤالًا على أربعة مستويات تدريبية.
- يخضع محرك الرياضيات وبنك الأسئلة لاختبار مقارنة مستقل؛ يجب أن يبقى المقطع المحمي لمحرك الرياضيات وبنك `MASTER_CHALLENGES` مطابقًا للمصدر الأساسي.
- جميع عبارات الأسئلة والخيارات تمر عبر اختبارات المحلل، مع حالات انحدار للأسس الصفرية والجذور والكسور والمعادلات.
- يختبر Playwright/Chromium عرض DOM والتفاعل عند 360×800، بما في ذلك السؤال والخيارات والإجابة والشرح والنتيجة وإعادة التحدي.
- أضيفت ضوابط CSS لتكبير التعبير الرياضي وضبط ظهور الأسس دون تعديل معطيات الأسئلة.
- أزيلت واجهات المعاينة والتطوير غير اللازمة لتطبيق Android.
- أُضيفت إلى داخل التطبيق روابط بريد الدعم والهاتف وسياسة الخصوصية.

## الدعم والإشراف
- إشراف ومتابعة المحتوى الرياضي: **أ. أكرم زايد**
- بريد الدعم الرسمي: **Akramzayed95@gmail.com**
- هاتف التواصل: **770101800**
- سياسة الخصوصية: https://akramzayed222-ship-it.github.io/-/privacy-policy-ar.html (تحقق من نجاح النشر قبل استعمال الرابط في Play Console).

## البناء والجودة
- Workflow: [AL-MOFEED Android Play Release Assurance](.github/workflows/build-apk.yml)
- Integrity manifest: [SOURCE_INTEGRITY.txt](SOURCE_INTEGRITY.txt)
- بيانات المتجر: [PLAY_STORE_RELEASE_CHECKLIST_AR.md](PLAY_STORE_RELEASE_CHECKLIST_AR.md)
- سياسة الخصوصية: [PRIVACY_POLICY_AR.md](PRIVACY_POLICY_AR.md)
- صفحة HTML: [docs/privacy-policy-ar.html](docs/privacy-policy-ar.html)

## توقيع Google Play — حاجز إلزامي
- APK الناتج عن `assembleDebug` مخصص للاختبار فقط.
- يجب عدم رفع `app-release.aab` ما لم يكن موقّعًا بمفتاح الرفع الصحيح وتُظهر عملية البناء `SIGNED_AND_JARSIGNER_VERIFIED`.
- أسرار التوقيع المطلوبة: `PLAY_UPLOAD_KEYSTORE_BASE64`, `PLAY_UPLOAD_KEYSTORE_PASSWORD`, `PLAY_UPLOAD_KEY_ALIAS`, `PLAY_UPLOAD_KEY_PASSWORD`.
- لا تضع ملف keystore أو كلمات المرور في المستودع.
- لا يعني نجاح CI أو تجهيز بيانات المتجر أن Google Play قبل التطبيق أو نشره.

## بوابات ما قبل الإطلاق
1. نجاح Workflow على commit الإصدار المرشح.
2. التحقق من بنك التمارين والخيارات ومحلل الرياضيات بعد كل تغيير.
3. توقيع AAB بمفتاح الرفع الصحيح والتحقق من SHA-256.
4. اختبار النسخة على هاتف Android حقيقي، خصوصًا عرض الأسس والجذور والكسور والخيارات والشرح.
5. التأكد من فتح صفحة سياسة الخصوصية العامة دون تسجيل دخول.
6. إكمال الأيقونة وصورة Feature Graphic ولقطات الشاشة الأصلية وData safety وContent rating والجمهور المستهدف.
7. رفع نسخة إلى مسار الاختبار الملائم، ثم إرسالها للمراجعة فقط بعد اكتمال كل البوابات.
