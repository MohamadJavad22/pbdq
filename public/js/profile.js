
                    // !$$$$$$$$$$$$$$$$$$$$$$$

                           // مقداردهی پیش‌فرض برای عناصر
        document.addEventListener("DOMContentLoaded", () => {
            const defaultValues = {
                username: "--",
                email: "ایمیل وارد نشده است",
                fullname: "نام کامل وارد نشده است",
                "project-title": "index.html#target",  // لینک جدید برای project-title
                "delivery-date": "تاریخ مشخص نشده",
                "admin-message": "پیامی وارد نشده است",
                "total-price": "0"
            };
    
            // یافتن و مقداردهی عناصر
            Object.entries(defaultValues).forEach(([id, defaultValue]) => {
                const element = document.getElementById(id);
                if (element) {
                    if (id === "project-title" && !element.textContent.trim()) {
                        // ایجاد لینک برای project-title
                        const link = document.createElement("a");
                        link.href = defaultValue;  // لینک به index.html#target
                        link.textContent = " یه پروژه ثبت کن "; // متن لینک که به جای -- نشان داده می‌شود
                        element.textContent = ''; // پاک کردن متن قبلی
                        
                        // افزودن استایل‌های دکمه به لینک
                        link.style.display = "inline-block";
                        link.style.padding = "10px 20px";
                        link.style.backgroundColor = "#4CAF50";  // رنگ پس‌زمینه
                        link.style.color = "white";  // رنگ متن
                        link.style.textAlign = "center";
                        link.style.textDecoration = "none";
                        link.style.borderRadius = "5px";
                        link.style.fontSize = "16px";
                        link.style.cursor = "pointer";
                        link.style.transition = "background-color 0.3s";
    
                        // افزودن افکت هاور به دکمه
                        link.addEventListener("mouseenter", () => {
                            link.style.backgroundColor = "#45a049";  // تغییر رنگ پس‌زمینه هنگام هاور
                        });
                        link.addEventListener("mouseleave", () => {
                            link.style.backgroundColor = "#4CAF50";  // بازگشت به رنگ اصلی
                        });
    
                        element.appendChild(link);
                    } else if (!element.textContent.trim()) {
                        element.textContent = defaultValue;
                    }
                }
            });
        });

        // !$$$$$$$$$$$$$$$$$$$


                // بارگذاری اطلاعات پروفایل کاربر
                fetch('/profile-data')
                .then(response => response.json())
                .then(data => {
                    if (data.user) {
                        document.getElementById('username').textContent = data.user.username;
                        document.getElementById('fullname').textContent = data.user.fullname;
                        document.getElementById('email').textContent = data.user.email;
                        document.getElementById('password').textContent = data.user.password;
                    } else {
                        alert('لطفاً وmmmmmmmارد شوید.');
                        window.location.href = 'login,signup/login,client.html';
                    }
                })
                .catch(error => console.error('Error fetching profile:', error));


        // بارگذاری پروژه‌های ثبت‌شده کاربر
// بارگذاری پروژه‌های ثبت‌شده کاربر
fetch('/profile-forms')
    .then(response => response.json())
    .then(data => {
        const projectsContainer = document.getElementById('projects-container');

        if (data.forms && data.forms.length > 0) {
            data.forms.forEach(form => {
                const projectItem = document.createElement('div');
                projectItem.classList.add('project-item');
                projectItem.innerHTML = `
                    <p><strong>نام پروژه:</strong> ${form.projectName}</p>
                    <p><strong>توضیحات پروژه:</strong> ${form.projectDescription}</p>
                    <p><strong>نوع سایت:</strong> ${form.siteType}</p>
                    <p><strong>زبان‌ها:</strong> ${form.languages}</p>
                    <p><strong>ویژگی‌ها:</strong> ${form.features}</p>
                    <p><strong>شماره تماس:</strong> ${form.phoneNumber}</p>
                    <p><strong>ایمیل:</strong> ${form.email}</p>
                    <p><strong>سوالات دیگر:</strong> ${form.otherQuestions}</p>
                    <p><strong>وضعیت تبلیغات:</strong> ${form.allowAds}</p>
                    <p><strong>رنگ‌ها:</strong> ${form.colors}</p>
                    <p><strong>تاریخ ثبت:</strong> ${form.date}</p>
                `;
                projectsContainer.appendChild(projectItem);

                // افزودن قابلیت باز و بسته شدن
                projectItem.addEventListener('click', function() {
                    this.classList.toggle('open');
                });
            });
        } else {
            projectsContainer.innerHTML = '<p>هیچ پروژه‌ای ثبت نشده است.</p>';
        }
    })
    .catch(error => console.error('Error fetching forms:', error));


// !$$$$$$$$$$$$$$$$$$$$




    document.addEventListener('DOMContentLoaded', () => {
        const changePasswordBtn = document.getElementById('change-password-btn');
        const passwordModal = document.getElementById('password-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const passwordForm = document.getElementById('password-form');
        const submitButton = passwordForm.querySelector('.submit-btn');
    
        console.log('Script loaded successfully.');
    
        // Show modal
        changePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Opening modal...');
            passwordModal.classList.remove('hidden');
        });
    
        // Close modal
        closeModalBtn.addEventListener('click', () => {
            console.log('Closing modal...');
            passwordModal.classList.add('hidden');
        });
    
        // Close modal when clicking outside content
        window.addEventListener('click', (e) => {
            if (e.target === passwordModal) {
                console.log('Closing modal from outside click...');
                passwordModal.classList.add('hidden');
            }
        });
    
        // Enable submit button only when all fields are filled
        passwordForm.addEventListener('input', () => {
            const inputs = Array.from(passwordForm.elements).filter(
                (el) => el.tagName === 'INPUT' && el.type !== 'submit'
            );
            const allFieldsFilled = inputs.every(input => input.value.trim() !== '');
            console.log('All fields filled:', allFieldsFilled);
            submitButton.disabled = !allFieldsFilled;
        });
    
        // Handle form submission
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted.');
    
            const username = passwordForm.username.value.trim();
            const currentPassword = passwordForm['current-password'].value.trim();
            const newPassword = passwordForm['new-password'].value.trim();
            const confirmPassword = passwordForm['confirm-password'].value.trim();
    
            if (newPassword !== confirmPassword) {
                alert('رمز جدید و تایید آن مطابقت ندارند.');
                console.log('Passwords do not match.');
                return;
            }
    
            console.log('Sending data to server...');
            fetch('/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, currentPassword, newPassword }),
            })
                .then(response => {
                    console.log('Response received:', response);
                    return response.json();
                })
                .then(data => {
                    console.log('Response data:', data);
                    if (data.success) {
                        passwordModal.classList.add('hidden');
                        passwordForm.reset();
                        submitButton.disabled = true;
                        alert(data.message || 'رمز عبور با موفقیت تغییر یافت.');
                    } else {
                        alert(data.message || 'خطایی رخ داده است.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('خطا در ارتباط با سرور.');
                });
        });
    });

    // !$$$$$$$$$$$$$$$$$$$



     
// !<!-- !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    کوکی -->


// تابع حذف کوکی
function deleteUserCookie() {
    document.cookie = 'username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    alert('شما با موفقیت از سیستم خارج شدید.');
    window.location.href = 'login,signup/login,client.html'; // انتقال به صفحه ورود بعد از خروج
}

// افزودن رویداد برای دکمه خروج
const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', deleteUserCookie);

// بررسی وضعیت ورود کاربر در بارگذاری صفحه
window.onload = function() {
    const username = getUserFromCookie();
    if (!username) {
        window.location.href = 'login,signup/login,client.html'; // اگر کاربر وارد نشده باشد، به صفحه ورود هدایت شود
    }
};

// تابع خواندن کوکی
function getUserFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name.trim() === 'username') {
            return value;
        }
    }
    return null;
}



// !$$$$$$$$$$$$$$$$$

const menuButton = document.getElementById('menu-button');
const menu = document.getElementById('menu');
const navList = document.querySelector('.nav__list');
const robotContainer = document.getElementById('robot-icons');
const backButton = document.querySelector('.back-button');

menuButton.addEventListener('click', () => {
    menu.classList.toggle('active'); // باز کردن یا بستن نوار
    navList.classList.toggle('active'); // نمایش یا مخفی کردن منو
});

// نمایش آیکن‌های ربات
function showRobotIcons() {
    robotContainer.style.display = 'flex'; // نمایش آیکن‌های ربات
    backButton.style.display = 'block'; // نمایش دکمه بازگشت
    navList.style.display = 'none'; // مخفی کردن منوی اصلی
}

// بازگشت به منو
function backToMenu() {
    robotContainer.style.display = 'none'; // مخفی کردن آیکن‌های ربات
    backButton.style.display = 'none'; // مخفی کردن دکمه بازگشت
    navList.style.display = 'flex'; // نمایش منوی اصلی
}




// !@#$

// !### ----- تب ها

function showTab(index) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach((tab, i) => {
        if (i === index) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    contents.forEach((content, i) => {
        if (i === index) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}



// !@#$
