const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// last middleware returns 404
app.use((req, res, next) => {
    res.status(404).send('Not Found!');
});

// error handling middleware
app.use((err, req, res, next) => {
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});