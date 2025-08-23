 
import app from './src/app.js';
const PORT = process.env.PORT || 3000;

app.listen(PORT, process.env.BASE_URL ,()=> {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
