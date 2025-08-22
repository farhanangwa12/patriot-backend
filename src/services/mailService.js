 
async function testsendmail() {
    try {
        const response = await fetch('https://api.mailry.co/ext/inbox/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MAILRY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emailId: '3d243f24-3fd2-4c7c-bb7f-d599d72870a2',
                to: 'narutokah3@gmail.com',
                subject: 'Thanks for your order!',
                htmlBody: '<html><body><h1>Order Confirmation</h1><p>Your order #12345 has been received.</p></body></html>',
                plainBody: "Order Confirmation. Your order #12345 has been received.",
                attachments: []
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Email berhasil dikirim!");
            console.log("Response:", data);
        } else {
            console.error("❌ Gagal kirim email. Status:", response.status);
            const errorData = await response.json();
            console.error("Error detail:", errorData);
        }
    } catch (error) {
        console.error('terjadi kesalahan', error);
    }
}


export testsendmail;