const express = require('express');
const session = require('express-session');
const compression = require('compression');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;
const JWT_SECRET_KEY = 'your-secret-key';  // کلید محرمانه JWT

// پیکربندی express-session
app.use(session({
    secret: JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // در صورت استفاده از HTTPS
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 ساعت
    },
}));

// پیکربندی CORS برای اجازه دسترسی به API از دامین یا پورت مشخص
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    credentials: true, // اجازه استفاده از کوکی‌ها
}));

// تنظیمات میانه‌افزارها
app.use(compression()); // کاهش حجم پاسخ‌های HTTP
app.use(express.json()); // تجزیه درخواست‌های JSON
app.use(express.urlencoded({ extended: true })); // تجزیه فرم‌های URLencoded

// مسیرهای استاتیک
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', express.static(path.join(__dirname, 'files')));

// Middleware شناسایی کاربر از طریق توکن JWT
app.use((req, res, next) => {
    const userToken = req.headers['authorization'];

    if (userToken) {
        try {
            const decoded = jwt.verify(userToken, JWT_SECRET_KEY);
            req.user = decoded;
            console.log('User identified:', decoded);
        } catch (err) {
            console.error('Invalid token:', err.message);
            req.user = null;
        }
        
    } else {
        console.log('No token provided.');
        req.user = null;
    }

    next();
});

// ارسال فایل‌های HTML (صفحه اصلی)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// اتصال به پایگاه داده SQLite
const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});




// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !----------   دیتا بیس ورود ایفریم ها برایه نمونه وب  -------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    iframeLink TEXT NOT NULL,
    iframeImage TEXT NOT NULL,
    viewCount INTEGER DEFAULT 0,
    likeCount INTEGER DEFAULT 0,
    row INTEGER NOT NULL
)`);

// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !-------------   دیتا بیس ورود اطلاعات سفارش کاربران ---------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='forms'", (err, row) => {
    if (!row) {
        db.run(`CREATE TABLE IF NOT EXISTS forms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            projectName TEXT,
            projectDescription TEXT,
            siteType TEXT,
            languages TEXT,
            features TEXT,
            phoneNumber TEXT,
            email TEXT,
            otherQuestions TEXT,
            allowAds TEXT,
            colors TEXT,
            date TEXT
        )`);
        console.log('Table created successfully.');
    }
});

// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !-------------   دیتا بیس ورود کاربران -----------------------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


// ایجاد جدول کاربران
app.use(bodyParser.json());

// ایجاد جدول کاربران
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`);








// ایجاد جدول پیام‌ها
db.run(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fromUserId INTEGER NOT NULL,
        toUserId INTEGER NOT NULL,
        text TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fromUserId) REFERENCES users(id),
        FOREIGN KEY (toUserId) REFERENCES users(id)
    )
`);







// API برای گرفتن پیام‌ها بین مدیر و کاربر
app.get('/get-messages/:userId', (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const sql = `
        SELECT messages.text, messages.timestamp, users.username AS sender
        FROM messages
        JOIN users ON messages.fromUserId = users.id
        WHERE (messages.fromUserId = ? AND messages.toUserId = ?)
        OR (messages.fromUserId = ? AND messages.toUserId = ?)
        ORDER BY messages.timestamp ASC
    `;
    db.all(sql, [userId, 'admin', 'admin', userId], (err, rows) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ error: 'خطا در دریافت پیام‌ها' });
        }
        res.json(rows);
    });
});




// API برای ارسال پیام از مدیر به کاربر
app.post('/send-message', (req, res) => {
    const { fromUserId, toUserId, text } = req.body;

    if (!fromUserId || !toUserId || !text) {
        return res.status(400).json({ error: 'تمامی فیلدها الزامی هستند' });
    }

    const sql = 'INSERT INTO messages (fromUserId, toUserId, text) VALUES (?, ?, ?)';
    db.run(sql, [fromUserId, toUserId, text], function (err) {
        if (err) {
            console.error('Error sending message:', err);
            return res.status(500).json({ error: 'خطا در ارسال پیام' });
        }
        res.json({ success: true, message: 'پیام با موفقیت ارسال شد' });
    });
});






// API برای گرفتن لیست کاربران
app.get('/get-users', (req, res) => {
    const sql = 'SELECT id, username, fullname FROM users';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'خطا در دریافت کاربران' });
        }
        res.json(rows);
    });
});




// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !-------------   دیتا بیس ربات -----------------------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@






// ایجاد جدول bot_responses اگر وجود نداشته باشد
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS bot_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_message TEXT NOT NULL,
            bot_reply TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table is ready.');
        }
    });
});





// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !-------------   بخش منطق ربات ----------------------------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@





// تابعی برای دریافت پاسخ ربات از پایگاه داده
function getBotReply(userMessage, callback) {
    db.get(
        "SELECT bot_reply FROM bot_responses WHERE user_message = ?",
        [userMessage],
        (err, row) => {
            if (err) {
                console.error('Error fetching data:', err.message);
                callback('مشکلی پیش آمده است.');
            } else {
                callback(row ? row.bot_reply : 'متوجه نشدم، لطفاً واضح‌تر بگو.');
            }
        }
    );
}

// مسیر API برای چت با ربات
app.post('/chat', (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ reply: 'لطفاً پیام خود را وارد کنید.' });
    }

    // دریافت پاسخ ربات
    getBotReply(userMessage, (botReply) => {
        res.json({ reply: botReply });
    });
});

// مسیر API برای دریافت پاسخ‌ها از پایگاه داده
app.get('/api/responses', (req, res) => {
    db.all("SELECT * FROM bot_responses", [], (err, rows) => {
        if (err) {
            console.error('Error fetching responses:', err.message);
            return res.status(500).json({ error: 'خطا در دریافت داده‌ها' });
        }
        res.json(rows);
    });
});

// مسیر API برای اضافه کردن یک پاسخ جدید
app.post('/api/responses', (req, res) => {
    const { user_message, bot_reply } = req.body;
    const stmt = db.prepare("INSERT INTO bot_responses (user_message, bot_reply) VALUES (?, ?)");
    stmt.run(user_message, bot_reply, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, user_message, bot_reply });
    });
    stmt.finalize();
});

// مسیر API برای ویرایش یک پاسخ
app.put('/api/responses/:id', (req, res) => {
    const { user_message, bot_reply } = req.body;
    const { id } = req.params;
    const stmt = db.prepare("UPDATE bot_responses SET user_message = ?, bot_reply = ? WHERE id = ?");
    stmt.run(user_message, bot_reply, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Response updated successfully' });
    });
    stmt.finalize();
});

// مسیر API برای حذف یک پاسخ
app.delete('/api/responses/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM bot_responses WHERE id = ?");
    stmt.run(id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Response deleted successfully' });
    });
    stmt.finalize();
});





// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !-------------   بخش ثبت نام کاربران ----------------------------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@



app.post('/signup', (req, res) => {
    const { fullname, email, username, password } = req.body;

    if (!fullname || !email || !username || !password) {
        return res.status(400).json({ message: 'تمامی فیلدها الزامی هستند.' });
    }

    // هش کردن رمز عبور
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err.message);
            return res.status(500).json({ message: 'خطا در پردازش رمز عبور.' });
        }

        const query = `
        INSERT INTO users (fullname, email, username, password)
        VALUES (?, ?, ?, ?)
        `;

        db.run(query, [fullname, email, username, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ message: 'ایمیل یا نام کاربری تکراری است.' });
                }
                console.error('Error inserting user:', err.message);
                return res.status(500).json({ message: 'خطا در ثبت نام.' });
            }

            // ورود به سیستم بعد از ثبت نام
            const loginQuery = `SELECT * FROM users WHERE username = ?`;
            db.get(loginQuery, [username], (err, user) => {
                if (err) {
                    console.error('Login error:', err.message);
                    return res.status(500).json({ message: 'خطا در ورود به سیستم.' });
                }

                if (!user) {
                    return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است.' });
                }

                // مقایسه رمز عبور وارد شده با رمز عبور هش شده
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        console.error('Error comparing passwords:', err.message);
                        return res.status(500).json({ message: 'خطا در مقایسه رمز عبور.' });
                    }

                    if (!result) {
                        return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است.' });
                    }

                    // ساخت توکن JWT برای کاربر
                    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET_KEY, { expiresIn: '1h' });

                    // ارسال توکن به کلاینت
                    res.status(200).json({
                        message: 'ثبت نام موفقیت‌آمیز بود. شما هم‌اکنون وارد سیستم شده‌اید.',
                        token: token,
                    });
                });
            });
        });
    });
});

// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !-------------   بخش ورود کاربران ----------------------------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// ورود به سیستم

// ورود به سیستم
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'تمامی فیلدها الزامی هستند.' });
    }

    const query = `SELECT * FROM users WHERE username = ?`;

    db.get(query, [username], (err, row) => {
        if (err) {
            console.error('Error querying database:', err.message);
            return res.status(500).json({ message: 'خطا در بررسی اطلاعات.' });
        }

        if (!row) {
            return res.status(401).json({ message: 'نام کاربری یا کلمه عبور اشتباه است.' });
        }

        // مقایسه رمز عبور با استفاده از bcrypt
        bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
                console.error('Error comparing password:', err.message);
                return res.status(500).json({ message: 'خطا در بررسی اطلاعات.' });
            }

            if (!result) {
                return res.status(401).json({ message: 'نام کاربری یا کلمه عبور اشتباه است.' });
            }

            // ذخیره اطلاعات کاربر در نشست
            req.session.user = row;

            // ورود موفقیت‌آمیز - هدایت به صفحه پروفایل
            res.status(200).json({
                message: 'ورود موفقیت‌آمیز بود.',
                redirect: '/profile',
            });
        });
    });
});

app.get('/profile', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/public/profile.html'); // ارسال صفحه HTML پروفایل
    } else {
        res.redirect('/public/login,signup/login,client.html'); // انتقال به صفحه لاگین
    }
});

app.get('/profile-data', (req, res) => {
    if (req.session.user) {
        res.json({
            user: req.session.user
        });
    } else {
        res.status(401).json({ message: "لطفاً وارد شوید." });
    }
});



// نمایش اطلاعات کاربران از فایل مدیریت کاربران
// نمایش اطلاعات کاربران از پایگاه داده و ارسال به HTML
app.get('/show-users', (req, res) => {
    const query = `SELECT * FROM users`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            return res.status(500).json({ message: 'خطا در دریافت اطلاعات کاربران.' });
        }

        // ارسال داده‌ها به صفحه HTML
        res.status(200).json({ users: rows });
    });
});



// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !-------------   بخش تغییر پسورد کاربران ----------------------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// بخش تغییر پسورد
// بخش تغییر پسورد
app.post('/change-password', (req, res) => {
    console.log('Received request:', req.body);  // لاگ دریافتی درخواست
    
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'تمامی فیلدها الزامی هستند.' });
    }

    // بررسی نام کاربری
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], (err, user) => {
        if (err) {
            console.error('Error querying database:', err.message);
            return res.status(500).json({ message: 'خطا در بررسی اطلاعات کاربری.' });
        }

        if (!user) {
            return res.status(404).json({ message: 'کاربری با این نام وجود ندارد.' });
        }

        console.log('User found:', user); // لاگ اطلاعات کاربر

        // مقایسه رمز عبور فعلی با رمز عبور ذخیره شده
        bcrypt.compare(currentPassword, user.password, (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err.message);
                return res.status(500).json({ message: 'خطا در بررسی رمز عبور فعلی.' });
            }

            if (!result) {
                return res.status(401).json({ message: 'رمز عبور فعلی اشتباه است.' });
            }

            console.log('Current password matches.'); // رمز عبور صحیح است

            // هش کردن پسورد جدید
            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing new password:', err.message);
                    return res.status(500).json({ message: 'خطا در پردازش پسورد جدید.' });
                }

                console.log('New password hashed successfully.'); // پسورد جدید هش شد

                // بروزرسانی رمز عبور در پایگاه داده
                const updateQuery = `UPDATE users SET password = ? WHERE username = ?`;
                db.run(updateQuery, [hashedPassword, username], function(err) {
                    if (err) {
                        console.error('Error updating password:', err.message);
                        return res.status(500).json({ message: 'خطا در تغییر رمز عبور.' });
                    }

                    res.status(200).json({ message: 'رمز عبور با موفقیت تغییر کرد.' });
                });
            });
        });
    });
});

// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !-------------     ورود اطلاعات سفارش کاربران ----------------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// Endpoint برای ذخیره اطلاعات فرم
app.post('/save-form', (req, res) => {
    const {
        projectName,
        projectDescription,
        siteType,
        languages,
        features,
        phoneNumber,
        email,
        otherQuestions,
        allowAds,
        colors,
        date // تاریخ نیز از داده‌های ورودی دریافت شود
    } = req.body;

    const query = `INSERT INTO forms (projectName, projectDescription, siteType, languages, features, phoneNumber, email, otherQuestions, allowAds, colors, date) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(
        query,
        [projectName, projectDescription, siteType, languages, features, phoneNumber, email, otherQuestions, allowAds, colors, date], // تاریخ به داده‌ها اضافه می‌شود
        function (err) {
            if (err) {
                console.error(err.message);
                res.json({ success: false });
            } else {
                res.json({ success: true, id: this.lastID });
            }
        }
    );
});



db.serialize(() => {
    db.all("PRAGMA table_info(forms);", (err, result) => {
        if (err) {
            console.error('Error checking table structure:', err);
            return;
        }

        const hasColorsColumn = result.some(column => column.name === 'colors');
        if (!hasColorsColumn) {
            // اگر ستون 'colors' وجود ندارد، آن را اضافه می‌کنیم
            db.run("ALTER TABLE forms ADD COLUMN colors TEXT", (err) => {
                if (err) {
                    console.error('Error adding colors column:', err);
                } else {
                    console.log('Colors column added successfully.');
                }
            });
        }
    });
});





app.get('/admin-data', (req, res) => {
    const query = `SELECT * FROM forms`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: err.message });
        }

        res.json({ success: true, data: rows });
    });
});





// !@------اطلاعات وضعیت رو از مدیر میگیره 

app.post('/save-admin-info', (req, res) => {
    const { id, price, deliveryDate, message } = req.body;

    // بررسی وجود فیلدهای ضروری
    if (!id || !price || !deliveryDate || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const query = `
        UPDATE forms 
        SET price = ?, deliveryDate = ?, message = ? 
        WHERE id = ?
    `;

    db.run(query, [price, deliveryDate, message, id], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, error: err.message });
        } else {
            return res.json({ success: true, id: this.lastID });
        }
    });
});


// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !----------            --------------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


app.post('/submit-form', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید." });
    }

    const { projectName, projectDescription, deliveryDate, price, message } = req.body;
    const email = req.session.user.email; // ایمیل کاربر از نشست

    const query = `
        INSERT INTO forms (projectName, projectDescription, deliveryDate, price, message, email) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [projectName, projectDescription, deliveryDate, price, message, email], (err) => {
        if (err) {
            console.error('Error saving form data:', err.message);
            return res.status(500).json({ message: "خطا در ذخیره اطلاعات پروژه." });
        }
        res.status(200).json({ message: "اطلاعات پروژه با موفقیت ذخیره شد." });
    });
});


app.get('/profile-projects', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید." });
    }

    const email = req.session.user.email;

    const query = `SELECT * FROM forms WHERE email = ?`;

    db.all(query, [email], (err, rows) => {
        if (err) {
            console.error('Error fetching projects:', err.message);
            return res.status(500).json({ message: "خطا در دریافت اطلاعات پروژه‌ها." });
        }
        res.status(200).json({ projects: rows });
    });
});



app.get('/profile-forms', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'لطفاً وارد شوید.' });
    }

    const userEmail = req.session.user.email; // ایمیل کاربر لاگین شده

    const query = `SELECT * FROM forms WHERE email = ?`;

    db.all(query, [userEmail], (err, rows) => {
        if (err) {
            console.error('Error retrieving user forms:', err.message);
            return res.status(500).json({ message: 'خطا در دریافت اطلاعات فرم‌ها.' });
        }

        res.json({ forms: rows });
    });
});

// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !----------     ورود ایفریم ها برایه نمونه وب  --------------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
app.post('/toggle-like/:itemId', (req, res) => {
    const userId = req.body.userId; // شناسه کاربر
    const itemId = req.params.itemId;

    db.get(
        `SELECT * FROM likes WHERE userId = ? AND itemId = ?`,
        [userId, itemId],
        (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, message: 'خطا در پایگاه داده.' });
            }

            if (row) {
                // حذف لایک
                db.run(
                    `DELETE FROM likes WHERE userId = ? AND itemId = ?`,
                    [userId, itemId],
                    (err) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).json({ success: false, message: 'خطا در حذف لایک.' });
                        }
// کاهش تعداد لایک‌ها و جلوگیری از منفی شدن
                        db.run(
                            `UPDATE items SET likeCount = CASE WHEN likeCount > 0 THEN likeCount - 1 ELSE 0 END WHERE id = ?`,
                            [itemId],
                            function (err) {
                                if (err) {
                                    console.error(err.message);
                                    return res.status(500).json({ success: false, message: 'خطا در کاهش تعداد لایک.' });
                                }
                                db.get(
                                    `SELECT likeCount FROM items WHERE id = ?`,
                                    [itemId],
                                    (err, row) => {
                                        if (err) {
                                            console.error(err.message);
                                            return res.status(500).json({ success: false, message: 'خطا در واکشی تعداد لایک.' });
                                        }
                                        res.json({ success: true, isLiked: false, likeCount: row.likeCount });
                                    }
                                );
                            }
                        );
                    }
                );
            } else {
// اضافه کردن لایک
                db.run(
                    `INSERT INTO likes (userId, itemId) VALUES (?, ?)`,
                    [userId, itemId],
                    (err) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).json({ success: false, message: 'خطا در افزودن لایک.' });
                        }
                        // افزایش تعداد لایک‌ها
                        db.run(
                            `UPDATE items SET likeCount = likeCount + 1 WHERE id = ?`,
                            [itemId],
                            function (err) {
                                if (err) {
                                    console.error(err.message);
                                    return res.status(500).json({ success: false, message: 'خطا در افزایش تعداد لایک.' });
                                }
                                db.get(
                                    `SELECT likeCount FROM items WHERE id = ?`,
                                    [itemId],
                                    (err, row) => {
                                        if (err) {
                                            console.error(err.message);
                                            return res.status(500).json({ success: false, message: 'خطا در واکشی تعداد لایک.' });
                                        }
                                        res.json({ success: true, isLiked: true, likeCount: row.likeCount });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        }
    );
});


// ایجاد آیتم جدید
app.post('/create-iframe', (req, res) => {
    console.log(req.body); // بررسی داده‌هایی که از کلاینت دریافت می‌کنید
    const { id, title, description, iframeLink, iframeImage, viewCount, likeCount, row } = req.body;

    const query = `INSERT INTO items (id, title, description, iframeLink, iframeImage, viewCount, likeCount, row)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [id, title, description, iframeLink, iframeImage, viewCount || 0, likeCount || 0, row], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'خطا در ارسال اطلاعات به پایگاه داده.' });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// به‌روزرسانی تعداد ویو
app.put('/update-view/:id', (req, res) => {
    const { id } = req.params;
    const { viewCount } = req.body;

    const query = `UPDATE items SET viewCount = ? WHERE id = ?`;

    db.run(query, [viewCount, id], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'خطا در به‌روزرسانی تعداد بازدید' });
        }
        res.json({ success: true, message: 'تعداد بازدید به‌روز شد' });
    });
});

// به‌روزرسانی تعداد لایک
app.put('/update-like/:id', (req, res) => {
    const { id } = req.params;
    const { likeCount } = req.body;

    const query = `UPDATE items SET likeCount = ? WHERE id = ?`;

    db.run(query, [likeCount, id], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'خطا در به‌روزرسانی تعداد لایک' });
        }
        res.json({ success: true, message: 'تعداد لایک به‌روز شد' });
    });
});

// حذف آیتم
app.delete('/delete-iframe/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM items WHERE id = ?';

    db.run(query, [id], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'خطا در حذف آیتم' });
        }
        res.json({ success: true, message: 'آیتم با موفقیت حذف شد' });
    });
});

// دریافت تمام آیتم‌ها
app.get('/get-items', (req, res) => {
    db.all('SELECT * FROM items ORDER BY row ASC', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'خطا در دریافت داده‌ها' });
        }
        res.json({ success: true, items: rows });
    });
});

// تغییر وضعیت لایک
app.post('/toggle-like/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT likeCount FROM items WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            console.error(err ? err.message : 'آیتم یافت نشد');
            return res.status(404).json({ success: false, message: 'آیتم یافت نشد' });
        }

        let newLikeCount = row.likeCount + 1;
        db.run('UPDATE items SET likeCount = ? WHERE id = ?', [newLikeCount, id], function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, message: 'خطا در به‌روزرسانی لایک' });
            }

            res.json({ success: true, likeCount: newLikeCount });
        });
    });
});

// افزایش تعداد بازدید
app.post('/increment-view/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT viewCount FROM items WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            console.error(err ? err.message : 'آیتم یافت نشد');
            return res.status(404).json({ success: false, message: 'آیتم یافت نشد' });
        }

        let newViewCount = row.viewCount + 1;
        db.run('UPDATE items SET viewCount = ? WHERE id = ?', [newViewCount, id], function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ success: false, message: 'خطا در به‌روزرسانی تعداد بازدید' });
            }

            res.json({ success: true, viewCount: newViewCount });
        });
    });
});

// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// !----------    پایااان ورود ایفریم ها برایه نمونه وب  -------
// !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@







// راه‌اندازی سرور
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
