const container = document.getElementById('custom-container');
const basePath1 = "../uploads/iframe/";
const basePath2 = "../uploads/Image/";

// دریافت داده‌ها از سرور
async function fetchItems() {
    try {
        const response = await fetch('/get-items');
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.items.length > 0) {
                data.items.forEach(item => createIframeElement(item));
            } else {
                container.innerHTML = '<p>هیچ آیفریمی موجود نیست.</p>';
            }
        } else {
            console.error('خطا در دریافت داده‌ها: ', response.status);
            container.innerHTML = '<p>خطا در بارگذاری آیتم‌ها.</p>';
        }
    } catch (error) {
        console.error('خطا در دریافت داده‌ها:', error);
        container.innerHTML = '<p>خطا در بارگذاری آیتم‌ها.</p>';
    }
}

// ایجاد عنصر آیفریم
function createIframeElement(item) {
    const iframeWrapper = document.createElement('div');
    iframeWrapper.classList.add('custom-iframe-wrapper');
    iframeWrapper.innerHTML = `
        <div class="custom-iframe-box" id="custom-iframe-box-${item.id}" data-title="${item.title}">
            <img src="${basePath2}${item.iframeImage}" class="custom-poster-image" alt="Poster" onclick="toggleIframe(${item.id})">
            <iframe src="${basePath1}${item.iframeLink}" frameborder="0" id="custom-iframe-${item.id}" class="custom-iframe" style="display: none;"></iframe>
            <button class="custom-fullscreen-btn" onclick="toggleFullscreen(${item.id})">Fullscreen</button>
        </div>
        <div class="custom-info-box" id="custom-info-box-${item.id}">
            <div class="custom-top-section">
                <div class="custom-info">
                    <span class="custom-views">View: <span class="custom-view-count">${item.viewCount}</span></span>
                </div>
                <div class="custom-icons">
                    <span class="custom-like-count">${item.likeCount}</span>
                    <button class="custom-icon custom-heart" onclick="toggleLike(${item.id})">
                        <span class="custom-heart-icon"><i class="fas fa-heart"></i></span>
                    </button>
                </div>
            </div>
            <div class="custom-bottom-section">
                <p>${item.description}</p>
                <p><b>Title:</b> ${item.title}</p>
                <button class="custom-view-more-btn" onclick="viewMore(${item.id}, '${item.title}', '${item.description}', '${basePath1}${item.iframeLink}')">مشاهده بیشتر</button>
            </div>
        </div>
    `;
    container.appendChild(iframeWrapper);
}
// تغییر وضعیت لایک
async function toggleLike(id) {
    const userId = 1; // این باید از سیستم احراز هویت دریافت شود.

    try {
        const response = await fetch(`/toggle-like/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        // بررسی موفقیت درخواست
        if (data.success) {
            const likeCountElement = document.querySelector(`#custom-info-box-${id} .custom-like-count`);
            likeCountElement.innerText = data.likeCount; // بروزرسانی تعداد لایک

            const heartIcon = document.querySelector(`#custom-info-box-${id} .custom-heart-icon`);
            const heartElement = heartIcon.querySelector('i');

            // تغییر وضعیت آیکن قلب
            if (data.isLiked) {
                heartElement.classList.remove('far');
                heartElement.classList.add('fas');
                heartElement.style.color = 'red';
            } else {
                heartElement.classList.remove('fas');
                heartElement.classList.add('far');
                heartElement.style.color = '';
            }
        } else {
            alert('خطا در تغییر وضعیت لایک.');
        }
    } catch (error) {
        console.error('خطا در تغییر وضعیت لایک:', error);
        alert('خطا در ارتباط با سرور.');
    }
}

// نمایش در حالت تمام‌صفحه
async function toggleFullscreen(id) {
    const iframeBox = document.getElementById(`custom-iframe-box-${id}`);
    const iframe = iframeBox.querySelector('iframe');
    const posterImage = iframeBox.querySelector('img');

    // نمایش iframe و مخفی کردن تصویر پوستر
    posterImage.style.display = 'none';
    iframe.style.display = 'block';

    if (!document.fullscreenElement) {
        // درخواست برای رفتن به حالت تمام صفحه
        try {
            await iframeBox.requestFullscreen();
        } catch (err) {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        }

        // تنظیم ارتفاع iframe در حالت تمام‌صفحه برای موبایل
        if (window.innerWidth <= 768) {
            iframe.style.height = '90vh'; // افزایش ارتفاع برای موبایل
        }

        // بروزرسانی تعداد بازدید
        try {
            const response = await fetch(`/increment-view/${id}`, { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                const viewCountElement = document.querySelector(`#custom-info-box-${id} .custom-view-count`);
                viewCountElement.innerText = data.viewCount;
            } else {
                console.error('خطا در به‌روزرسانی تعداد بازدید.');
            }
        } catch (error) {
            console.error('خطا در به‌روزرسانی تعداد بازدید:', error);
        }
    } else {
        // خروج از حالت تمام‌صفحه
        document.exitFullscreen();
        iframe.style.height = ''; // بازگرداندن ارتفاع به حالت پیش‌فرض
    }
}

// ارسال به صفحه جدید با اطلاعات
function viewMore(id, title, description, iframeLink) {
    const url = `/view-more.html?id=${id}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&iframeLink=${encodeURIComponent(iframeLink)}`;
    window.location.href = url;
}
// بارگذاری آیتم‌ها
fetchItems();
