      // دریافت داده‌ها از سرور و نمایش آن‌ها در جدول
      window.onload = function() {
        fetch('/adminData')
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById('requestsTableBody');
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.project_name}</td>
                        <td>${item.project_description}</td>
                        <td>${item.site_type}</td>
                        <td>${item.languages}</td>
                        <td>${item.features}</td>
                        <td>${item.phone_number}</td>
                        <td>${item.email}</td>
                        <td>${item.other_questions}</td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };



    // آدرس سرور
    const apiUrl = 'http://localhost:3000';

    // دریافت لیست آیتم‌ها
    const fetchItems = async () => {
        try {
            const response = await fetch(`${apiUrl}/get-items`);
            const data = await response.json();
            const tableBody = document.querySelector('#items-table tbody');
            tableBody.innerHTML = ''; // پاک کردن محتوای قبلی
            data.items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.title}</td>
                    <td>${item.description}</td>
                    <td><a href="${item.iframeLink}" target="_blank">مشاهده</a></td>
                    <td><img src="${item.iframeImage}" alt="Image" width="50"></td>
                    <td>
                        <button class="update-view" data-id="${item.id}" data-view="${item.viewCount}">${item.viewCount} بازدید</button>
                    </td>
                    <td>
                        <button class="update-like" data-id="${item.id}" data-like="${item.likeCount}">${item.likeCount} لایک</button>
                    </td>
                    <td>
                        <button class="delete-item" data-id="${item.id}">حذف</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    // ارسال فرم برای ایجاد آیتم جدید
    document.getElementById('create-item-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const iframeLink = document.getElementById('iframeLink').value;
        const iframeImage = document.getElementById('iframeImage').value;
        const row = document.getElementById('row').value;

        const newItem = {
            title,
            description,
            iframeLink,
            iframeImage,
            row
        };

        try {
            const response = await fetch(`${apiUrl}/create-iframe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });

            const result = await response.json();
            if (result.success) {
                alert('آیتم با موفقیت ایجاد شد');
                fetchItems();
            } else {
                alert('خطا در ایجاد آیتم');
            }
        } catch (error) {
            console.error('Error creating item:', error);
        }
    });

    // بروزرسانی تعداد بازدید
    document.body.addEventListener('click', async (event) => {
        if (event.target.classList.contains('update-view')) {
            const id = event.target.getAttribute('data-id');
            let viewCount = parseInt(event.target.getAttribute('data-view')) + 1;
            try {
                const response = await fetch(`${apiUrl}/update-view/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ viewCount })
                });

                const result = await response.json();
                if (result.success) {
                    event.target.textContent = `${viewCount} بازدید`;
                } else {
                    alert('خطا در به‌روزرسانی تعداد بازدید');
                }
            } catch (error) {
                console.error('Error updating view:', error);
            }
        }

        // بروزرسانی تعداد لایک
        if (event.target.classList.contains('update-like')) {
            const id = event.target.getAttribute('data-id');
            let likeCount = parseInt(event.target.getAttribute('data-like')) + 1;
            try {
                const response = await fetch(`${apiUrl}/update-like/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ likeCount })
                });

                const result = await response.json();
                if (result.success) {
                    event.target.textContent = `${likeCount} لایک`;
                } else {
                    alert('خطا در به‌روزرسانی تعداد لایک');
                }
            } catch (error) {
                console.error('Error updating like:', error);
            }
        }

        // حذف آیتم
        if (event.target.classList.contains('delete-item')) {
            const id = event.target.getAttribute('data-id');
            try {
                const response = await fetch(`${apiUrl}/delete-iframe/${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();
                if (result.success) {
                    alert('آیتم با موفقیت حذف شد');
                    fetchItems();
                } else {
                    alert('خطا در حذف آیتم');
                }
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    });

    // بارگذاری آیتم‌ها
    fetchItems();





