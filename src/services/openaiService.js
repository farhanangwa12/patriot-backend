import OpenAI from "openai";


export const openAiService = {
  generateQuiz: async ({total_soal, status_soal }) => {
    const openai = new OpenAI({
      baseURL: 'https://api.unli.dev/v1',
      apiKey: process.env.UNLI_API_KEY
    });

    

    // const completion = await openai.chat.completions.create({
    //   messages: [{
    //     role: "user",
    //     content: `Buatkan ${total_soal} soal tentang patriotisme Indonesia.
    // Saya akan memberikan input JSON yang berisi status (fakta / bukan_fakta).

    // Jika status = "fakta", maka buat soal berbentuk cerita singkat (1–3 kalimat) yang sesuai fakta sejarah patriotisme Indonesia, lalu akhiri dengan pertanyaan. Jawaban/koreksi ditulis di field fakta.

    // Jika status = "bukan_fakta", maka buat soal berbentuk cerita singkat (1–3 kalimat) yang berisi informasi salah/melenceng, lalu akhiri dengan pertanyaan. Koreksi ditulis di field fakta.

    // Format output HARUS JSON array dengan struktur:

    // [
    //   { "soal": "cerita + pertanyaan?", "fakta": "isi fakta unik atau koreksi" },
    //   { "soal": "cerita + pertanyaan?", "fakta": "isi fakta unik atau koreksi" }
    // ]


    // Jangan tambahkan penjelasan di luar JSON.


    // input saya: [ { "status": "fakta" }, { "status": "bukan_fakta" }, { "status": "fakta" }, { "status": "fakta" }, { "status": "bukan_fakta" }, { "status": "fakta" }, { "status": "fakta" }, { "status": "bukan_fakta" }, { "status": "fakta" }, { "status": "bukan_fakta" } ]`
    //   }],
    //   model: "auto"

    // });
    const completion = await openai.chat.completions.create({
      messages: [{
        role: "user",
        content: `Buatkan ${total_soal} soal tentang patriotisme Indonesia.
    Saya akan memberikan input JSON yang berisi status (fakta / bukan_fakta).

    Jika status = "fakta", maka buat soal berbentuk cerita singkat (1–3 kalimat) yang sesuai fakta sejarah patriotisme Indonesia, lalu akhiri dengan pertanyaan. Jawaban/koreksi ditulis di field fakta.

    Jika status = "bukan_fakta", maka buat soal berbentuk cerita singkat (1–3 kalimat) yang berisi informasi salah/melenceng, lalu akhiri dengan pertanyaan. Koreksi ditulis di field fakta.

    Format output HARUS JSON array dengan struktur:

    [
      { "soal": "cerita + pertanyaan?", "fakta": "isi fakta unik atau koreksi" },
      { "soal": "cerita + pertanyaan?", "fakta": "isi fakta unik atau koreksi" }
    ]


    Jangan tambahkan penjelasan di luar JSON.


    input saya: ${status_soal}`
      }],
      model: "auto"

    });

    const reply = completion.choices[0].message.content;
    return reply;
  },

  checkAnswerFromQuiz: async (user_answers) => {
    const openai = new OpenAI({
      baseURL: 'https://api.lunos.tech/v1',
      apiKey: process.env.UNLI_API_KEY
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
