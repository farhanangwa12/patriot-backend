import OpenAI from "openai";


export const openAiService = {
  generateQuiz: async ({ total_soal, topik, status_soal }) => {
    const openai = new OpenAI({
      baseURL: 'https://api.unli.dev/v1',
      apiKey: process.env.UNLI_API_KEY
    });

    const systemPrompt = `
      Kamu adalah generator soal otomatis.

      Aturan:
      - Buatkan soal berbentuk cerita singkat (1–3 kalimat).
      - Jika "status": "fakta", maka ceritanya harus sesuai fakta sejarah/topik.
      - Jika "status": "bukan_fakta", maka ceritanya harus memuat informasi keliru.
      - Setiap soal harus mengandung minimal 1 kata/tema dari field topik.
      - Akhiri setiap soal dengan sebuah pertanyaan.
      - Field "fakta" diisi dengan jawaban/koreksi singkat (1–2 kalimat).
      - Output hanya dalam format JSON array dengan struktur:
      [
        { "soal": "cerita + pertanyaan?", "fakta": "isi fakta unik atau koreksi" }
      ]
      - Jangan tambahkan penjelasan di luar JSON.
      `;

    const userPrompt = (total_soal, topik, data) => `
      Buatkan total ${total_soal} soal.
      Topik: ${topik}
      Data input: ${JSON.stringify(data)}
      `;

    const completion = await openai.chat.completions.create({
      model: "auto",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt(total_soal, topik, status_soal) }
      ]
    });

    // Ambil hasil string dari AI
    const raw = completion.choices[0].message.content;

    // Parse ke JS Array
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Gagal parse JSON dari AI:", err, raw);
      throw new Error("AI tidak mengembalikan JSON valid");
    }

    return parsed;
  },

  checkAnswerFromQuiz: async (user_answers) => {
    const openai = new OpenAI({
      baseURL: 'https://api.lunos.tech/v1',
      apiKey: process.env.LUNOS_API_KEY
    });

    let messages = [
      { role: "system", content: "Kamu adalah seorang guru yang sangat patriotisme Indonesia. Kamu memberi soal sejarah dengan format fakta atau bukan." },
      {
        role: "user", content: `Kamu adalah pemeriksa jawaban. Input diberikan dalam format JSON:

      [
        {
          "question": "bla bla ...",
          "fact": "blaa... bla...",
          "user_answer": "saya",
          "id": "1",
          "is_correct": null
        }
      ]
      Tugasmu adalah memeriksa apakah user_answer sesuai dengan fact. Jika sesuai → is_correct: true. Jika tidak sesuai → is_correct: false.
      Hasilkan output dalam format JSON dengan struktur berikut:

      [
        {
          "id": 1,
          "is_correct": true
        }
      ]
      Hanya keluarkan JSON tanpa penjelasan tambahan.
      input: ${user_answers}
      `
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4.1-mini",
      messages,
      temperature: 0.7

    });

    const reply = completion.choices[0].message.content;


    return reply;
  }
};



