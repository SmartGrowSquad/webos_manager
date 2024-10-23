const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

// 인증 데이터 API (authData.json)
app.get('/auth-data', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'authData.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading auth data' });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// 사용자 데이터 API (userData.json)
app.get('/user-data', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'userData.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading user data' });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// 설정 데이터 API (settingData.json)
app.get('/setting-data', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'settingData.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading setting data' });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// 설정 데이터 업데이트 API
app.post('/update-settings', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'settingData.json');
    const newData = JSON.stringify(req.body, null, 2); // 전달받은 JSON 데이터를 포맷팅

    fs.writeFile(filePath, newData, 'utf8', (err) => {
        if (err) {
            res.status(500).json({ error: 'Error saving setting data' });
        } else {
            res.json({ message: 'Settings updated successfully' });
        }
    });
});

app.get('/sales-data', (req, res) => {
    const salesDataPath = path.join(__dirname, 'data', 'salesData.json');
    fs.readFile(salesDataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading sales data:', err);
            return res.status(500).send('Error reading sales data');
        }
        res.json(JSON.parse(data));
    });
});

app.get('/monitoring-data', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'userData.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading monitoring data' });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/growth-data', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'growthData.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading growth data' });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
