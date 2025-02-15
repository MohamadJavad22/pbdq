document.addEventListener('DOMContentLoaded', () => {
    // دریافت اطلاعات از URL
    const urlParams = new URLSearchParams(window.location.search);
    const iframeId = urlParams.get('id');
    const iframeTitle = urlParams.get('title');

    // نمایش نوتیفیکیشن (اگر وجود داشته باشد)
    const notificationElement = document.getElementById('notification');
    const notificationIdElement = document.getElementById('notification-id');
    const notificationTitleElement = document.getElementById('notification-title');

    if (iframeId && iframeTitle) {
        notificationIdElement.textContent = iframeId;
        notificationTitleElement.textContent = iframeTitle;
        notificationElement.classList.add('show');
        setTimeout(() => {
            notificationElement.classList.add('shrink');
        }, 3000);
    }

    // گوش دادن به فرم ارسال
    const formDesign = document.getElementById('formDesign');
    formDesign.addEventListener('submit', async (e) => {
        e.preventDefault(); // جلوگیری از ارسال فرم به سرور

        // جمع‌آوری داده‌های فرم
        const formData = getFormData(iframeId, iframeTitle);

        // ارسال داده‌ها به سرور
        try {
            const response = await submitFormData(formData);
            const result = await response.json();

            if (result.success) {
                alert('اطلاعات با موفقیت ذخیره شد!');
                toggleFormVisibility();
                displayInvoice(formData);
            } else {
                alert('خطا در ذخیره اطلاعات!');
            }
        } catch (error) {
            console.error('Error in saving form data:', error);
            alert('مشکلی در ارسال اطلاعات پیش آمد!');
        }
    });
});

// تابع برای جمع‌آوری داده‌های فرم
// تابع برای جمع‌آوری داده‌های فرم
function getFormData(iframeId, iframeTitle) {
    const currentDate = new Date().toLocaleString(); // تاریخ و زمان جاری

    return {
        projectName: document.getElementById('projectName').value,
        projectDescription: document.getElementById('projectDescription').value,
        siteType: document.getElementById('siteType').value,
        languages: Array.from(document.querySelectorAll('input[name="languages"]:checked')).map(el => el.value).join(', '),
        features: Array.from(document.querySelectorAll('input[name="features"]:checked')).map(el => el.value).join(', '),
        phoneNumber: document.getElementById('phoneNumber').value,
        email: document.getElementById('email').value,
        otherQuestions: document.getElementById('otherQuestions').value,
        allowAds: document.getElementById('allowAds').checked ? "Yes" : "No", // ذخیره وضعیت تبلیغات
        colors: Array.from(document.querySelectorAll('input[name="colors"]')).map(el => el.value).join(', '), // رنگ‌ها
        notification: iframeId && iframeTitle ? `ID: ${iframeId}, Title: ${iframeTitle}` : "هیچ نوتیفیکیشنی دریافت نشد.", // اضافه کردن نوتیفیکیشن
        date: currentDate // اضافه کردن تاریخ و زمان جاری
    };
}


// تابع برای ارسال داده‌ها به سرور
async function submitFormData(formData) {
    const response = await fetch('/save-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });
    return response;
}

// تابع برای نمایش فاکتور و مخفی کردن فرم
function toggleFormVisibility() {
    document.getElementById('designForm').style.display = 'none';
    document.getElementById('invoice').style.display = 'block';
}

// تابع برای نمایش اطلاعات در فاکتور
// تابع برای نمایش اطلاعات در فاکتور
function displayInvoice(formData) {
    document.getElementById('invoiceProjectName').textContent = formData.projectName;
    document.getElementById('invoiceProjectDescription').textContent = formData.projectDescription;
    document.getElementById('invoiceSiteType').textContent = formData.siteType;
    document.getElementById('invoiceLanguages').textContent = formData.languages;
    document.getElementById('invoiceFeatures').textContent = formData.features;
    document.getElementById('invoicePhoneNumber').textContent = formData.phoneNumber;
    document.getElementById('invoiceEmail').textContent = formData.email;
    document.getElementById('invoiceOtherQuestions').textContent = formData.otherQuestions;

    // نمایش وضعیت تبلیغات در فاکتور
    document.getElementById('invoiceNotification').textContent = formData.allowAds === "Yes" ? "اجازه استفاده برای تبلیغات داده شده است." : "اجازه استفاده برای تبلیغات داده نشده است.";
    document.getElementById('invoiceColors').textContent = formData.colors; // نمایش رنگ‌ها در فاکتور

    // نمایش نوتیفیکیشن
    document.getElementById('invoiceNotification').textContent += ` | ${formData.notification}`;

    // نمایش تاریخ در فاکتور
    document.getElementById('invoiceDate').textContent = `تاریخ: ${formData.date}`; // اضافه کردن تاریخ و زمان
}
