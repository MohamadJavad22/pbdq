// !@@@@@@@@@@@@@@@@
// !@@@@@@@@@@@@@@@@
// ؟ این کد مربوط به تضریق اطلاعات ربات در دیتا بیس هست 
// !@@@@@@@@@@@@@@@@


const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// اتصال به پایگاه داده SQLite
const db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// خواندن داده‌ها از فایل JSON
fs.readFile('responses.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the JSON file:', err.message);
    return;
  }

  const responses = JSON.parse(data);

  // تزریق داده‌ها به جدول bot_responses
  const stmt = db.prepare("INSERT INTO bot_responses (user_message, bot_reply) VALUES (?, ?)");
  
  responses.forEach((response) => {
    stmt.run(response.user_message, response.bot_reply, function(err) {
      if (err) {
        console.error('Error inserting data:', err.message);
      }
    });
  });

  stmt.finalize(() => {
    console.log('Data inserted successfully!');
    db.close();
  });
});
