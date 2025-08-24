// aktifkan dotenv (pakai import, bukan require)
import dotenv from "dotenv";
dotenv.config();

// kalau kamu tidak pakai OpenAI, bisa dihapus
import OpenAI from "openai";
import readline from "readline";
async function testsendmail() {
    try {
        const response = await fetch('https://api.mailry.co/ext/inbox/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MAILRY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emailId: '8bf18365-7956-48c2-830a-2f1eb51cbe80',
                to: 'narutokah3@gmail.com',
                subject: 'Thanks for your order!',
                htmlBody: '<html><body><h1>Order Confirmation</h1><p>Your order #12345 has been received.</p></body></html>',
                plainBody: "Order Confirmation. Your order #12345 has been received."
            }),
        });

        if (response.ok) {
            const data = await response.json();
      
        } else {
            console.error("❌ Gagal kirim email. Status:", response.status);
            const errorData = await response.json();
            console.error("Error detail:", errorData);
        }
    } catch (error) {
        console.error('terjadi kesalahan', error);
    }
}

async function testgetemail() {
    try {
        const response = await fetch('https://api.mailry.co/ext/email', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.MAILRY_API_KEY}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ berhasil mendapatkan informasi email!");
            console.log(data);
        } else {
            console.error("❌ Gagal ambil email. Status:", response.status);
            const errorData = await response.json();
            console.error("Error detail:", errorData);
        }
    } catch (error) {
        console.error('terjadi kesalahan', error);
    }
}

async function unlidevtest() {
    try {
        const openai = new OpenAI({
            baseURL: "https://api.unli.dev/v1",
            apiKey: process.env.UNLI_API_KEY,
        });
        const completion = await openai.chat.completions.create({
            messages: [{
                role: "user", content: `Buatkan 10 soal tentang patriotisme Indonesia.
Saya akan memberikan input JSON yang berisi status (fakta / bukan_fakta).

Jika status = "fakta", maka buat soal berbentuk cerita singkat (1–3 kalimat) yang sesuai fakta sejarah patriotisme Indonesia, lalu akhiri dengan pertanyaan. Jawaban/koreksi ditulis di field fakta.

Jika status = "bukan_fakta", maka buat soal berbentuk cerita singkat (1–3 kalimat) yang berisi informasi salah/melenceng, lalu akhiri dengan pertanyaan. Koreksi ditulis di field fakta.

Format output HARUS JSON array dengan struktur:

[
  { "soal": "cerita + pertanyaan?", "fakta": "isi fakta unik atau koreksi" },
  { "soal": "cerita + pertanyaan?", "fakta": "isi fakta unik atau koreksi" }
]


Jangan tambahkan penjelasan di luar JSON.


input saya: [ { "status": "fakta" }, { "status": "bukan_fakta" }, { "status": "fakta" }, { "status": "fakta" }, { "status": "bukan_fakta" }, { "status": "fakta" }, { "status": "fakta" }, { "status": "bukan_fakta" }, { "status": "fakta" }, { "status": "bukan_fakta" } ]` }],
            model: "auto",
        });
        console.log('Unli.dev: ',completion.choices[0].message.content);
    } catch (error) {
        console.error("Error unli.dev:", error);
    }
}

const unlidevmodelget = async () => {
    const response = await fetch("https://api.unli.dev/v1/models", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${process.env.UNLI_API_KEY}`
        }
    });

    const data = await response.json();
    console.log(data);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const openai = new OpenAI({
    apiKey: process.env.LUNOS_API_KEY,
    baseURL: "https://api.lunos.tech/v1",
});

let messages = [
    { role: "system", content: "Kamu adalah seorang guru yang sangat patriotisme Indonesia. Kamu memberi soal sejarah dengan format fakta atau bukan." },
    {
        role: "user", content: `Buatkan 10 soal tentang patriotisme Indonesia.
Saya akan memberikan input JSON yang berisi status (fakta / bukan_fakta).

Jika status = "fakta", maka buat soal berbentuk cerita singkat (1–3 kalimat) yang sesuai fakta sejarah patriotisme Indonesia, lalu akhiri dengan pertanyaan. Jawaban/koreksi ditulis di field fakta.

Jika status = "bukan_fakta", maka buat soal berbentuk cerita singkat (1–3 kalimat) yang berisi informasi salah/melenceng, lalu akhiri dengan pertanyaan. Koreksi ditulis di field fakta.

Format output HARUS JSON array dengan struktur:

[
  { "soal": "cerita + pertanyaan?", "fakta": "isi fakta unik atau koreksi" },
  { "soal": "cerita + pertanyaan?", "fakta": "isi fakta unik atau koreksi" }
]


Jangan tambahkan penjelasan di luar JSON.


input saya: [ { "status": "fakta" }, { "status": "bukan_fakta" }, { "status": "fakta" }, { "status": "fakta" }, { "status": "bukan_fakta" }, { "status": "fakta" }, { "status": "fakta" }, { "status": "bukan_fakta" }, { "status": "fakta" }, { "status": "bukan_fakta" } ]` }
];

async function chatLoop() {
    try {
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-4.1-mini",
            messages,
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content;
        console.log("\nGPT 4.1 :", reply);

        // rl.question("Jawaban kamu: ", async (userInput) => {
        //     // Tambahkan jawaban user ke messages
        //     messages.push({ role: "user", content: userInput });

        //     // Minta AI kasih respon lanjutan
        //     messages.push({ role: "system", content: "Berikan penjelasan apakah jawabannya benar atau salah, lalu buatkan soal baru." });

        //     await chatLoop(); // panggil lagi untuk loop
        // });

    } catch (error) {
        console.error(error);
        rl.close();
    }
}



// jalankan function
testgetemail();
testsendmail();

// unlidevtest();
// unlidevmodelget();

// chatLoop();