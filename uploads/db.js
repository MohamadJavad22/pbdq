const sqlite3 = require('sqlite3').verbose();

// اتصال به دیتابیس SQLite
const db = new sqlite3.Database('./data.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return; // در صورت بروز خطا از ادامه کد جلوگیری می‌کند
  }
  console.log('Connected to the database.');
});

// ایجاد جدول فیلم‌ها یا محصولات در صورت عدم وجود
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      videoUrl TEXT NOT NULL,
      imageUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table "items" is ready.');
    }
  });
});

// اضافه کردن یک آیتم جدید
function addItem(title, description, videoUrl, imageUrl) {
  const query = `
    INSERT INTO items (title, description, videoUrl, imageUrl)
    VALUES (?, ?, ?, ?)
  `;
  
  db.run(query, [title, description, videoUrl, imageUrl], function(err) {
    if (err) {
      console.error('Error inserting item:', err);
    } else {
      console.log('Item added with ID:', this.lastID);
    }
  });
}

// دریافت تمام آیتم‌ها
function getItems(callback) {
  db.all('SELECT * FROM items ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching items:', err);
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
}

// نمونه استفاده از `addItem` و `getItems`
addItem('Sample Video', 'This is a description of the sample video', 'https://sample-video.com', 'https://sample-image.com');

getItems((err, items) => {
  if (err) {
    console.error('Failed to fetch items:', err);
  } else {
    console.log('Fetched items:', items);
  }
});

// ارسال دیتابیس به خارج
module.exports = db;
