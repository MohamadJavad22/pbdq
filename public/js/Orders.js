async function loadData() {
    const response = await fetch('/admin-data');
    const result = await response.json();

    console.log(result);  // بررسی داده‌های دریافتی از سرور

    if (result && result.success) {
        const ordersContainer = document.querySelector('#orders');
        ordersContainer.innerHTML = '';  // پاک کردن محتوای قبلی

        // مرتب‌سازی داده‌ها بر اساس تاریخ (در صورتی که موجود باشد)
        result.data.sort((a, b) => a.date ? new Date(b.date) - new Date(a.date) : 0); // بر اساس تاریخ مرتب می‌کنیم

        // هر داده دریافتی را به صورت کارت نمایش می‌دهیم
        result.data.forEach(row => {
            const orderDiv = document.createElement('div');
            orderDiv.classList.add('order');
            
            // دکمه‌های عمل
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('actions');
            
            // آیکن ارسال به یک نفر
            const sendButton = document.createElement('button');
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';  // آیکن ارسال
            sendButton.onclick = () => alert(`پروژه ارسال شد: ${row.projectName}`);
            actionsDiv.appendChild(sendButton);
            
            // آیکن ارسال به چند نفر
            const multiSendButton = document.createElement('button');
            multiSendButton.innerHTML = '<i class="fas fa-users"></i>';  // آیکن ارسال به چند نفر
            multiSendButton.onclick = () => alert(`پروژه به چند نفر ارسال شد: ${row.projectName}`);
            actionsDiv.appendChild(multiSendButton);
            
            // آیکن تماس
            const contactButton = document.createElement('button');
            contactButton.innerHTML = '<i class="fas fa-phone-alt"></i>';  // آیکن تماس
            contactButton.onclick = () => alert(`تماس برقرار شد: ${row.projectName}`);
            actionsDiv.appendChild(contactButton);
            
            orderDiv.appendChild(actionsDiv);
            
            // اضافه کردن محتوای سفارش
            const title = document.createElement('h3');
            title.textContent = `سفارش: ${row.projectName}`;
            orderDiv.appendChild(title);
            
            // اضافه کردن جزئیات سفارش
            const details = [
                `شناسه: ${row.id}`,
                `نام پروژه: ${row.projectName}`,
                `توضیحات: ${row.projectDescription}`,
                `نوع سایت: ${row.siteType}`,
                `زبان‌ها: ${row.languages}`,
                `ویژگی‌ها: ${row.features}`,
                `شماره تماس: ${row.phoneNumber}`,
                `ایمیل: ${row.email}`,
                `درخواست‌های دیگر: ${row.otherQuestions}`,
                `اجازه تبلیغات: ${row.allowAds}`,
                `رنگ‌ها: ${Array.isArray(row.colors) ? row.colors.join(', ') : row.colors}`,
            ];

            details.forEach(detail => {
                const [label, value] = detail.split(':');
                const p = document.createElement('p');
                p.textContent = `${label}: ${value}`;
                orderDiv.appendChild(p);
            });
            
            // اضافه کردن نوتیفیکیشن (اگر وجود داشته باشد)
            if (row.notification) {
                const notificationP = document.createElement('p');
                notificationP.textContent = `نوتیفیکیشن: ${row.notification}`;
                orderDiv.appendChild(notificationP);
            }

            // اضافه کردن تاریخ
            if (row.date) {
                const dateP = document.createElement('p');
                dateP.textContent = `تاریخ: ${row.date}`;  // نمایش تاریخ
                orderDiv.appendChild(dateP);
            }

            // حذف فیلدهای تاریخ تحویل، مبلغ و پیام

            // اضافه کردن سفارش به container
            ordersContainer.appendChild(orderDiv);
        });
    } else {
        alert('خطا در بارگذاری اطلاعات');
    }
}

// بارگذاری داده‌ها هنگام باز شدن صفحه
loadData();
