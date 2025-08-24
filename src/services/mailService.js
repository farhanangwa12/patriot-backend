import env from '../config/env.js';
import OtpModel from '../models/Otp.js';
class EmailService {
    constructor() {
        this.apiKey = env.MAILRY_API_KEY;
        this.baseUrl = 'https://api.mailry.co';
    }

    // Method untuk mengirim OTP via email
    async sendOTP({ emailId, to, otp, expiryMinutes = 5 }) {
        try {


            if (!to) {
                throw new Error('Email tujuan wajib ada');
            }

            if (!otp) {
                throw new Error('Kode OTP wajib ada');
            }

            if (!this.apiKey) {
                throw new Error('API Key Mailry tidak ditemukan');
            }

            // Buat HTML body untuk OTP
            const htmlBody = `
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2c3e50; margin-bottom: 10px;">🔐 Kode Verifikasi</h1>
                            <p style="color: #666; margin: 0;">Kode OTP untuk akun Anda</p>
                        </div>
                        
                        <div style="background-color: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <p style="font-size: 16px; margin-bottom: 20px;">Kode verifikasi Anda adalah:</p>
                            
                            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <span style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 5px; font-family: monospace;">
                                    ${otp}
                                </span>
                            </div>
                            
                            <p style="color: #666; font-size: 14px; margin-top: 20px;">
                                ⏰ Kode ini akan kedaluwarsa dalam <strong>${expiryMinutes} menit</strong>
                            </p>
                            
                            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #ffc107;">
                                <p style="margin: 0; font-size: 14px; color: #856404;">
                                    <strong>⚠️ Penting:</strong> Jangan bagikan kode ini kepada siapapun. 
                                    Tim kami tidak akan pernah meminta kode OTP Anda.
                                </p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #999; font-size: 12px;">
                                Email ini dikirim secara otomatis, mohon tidak membalas email ini.<br>
                                Dikirim pada ${new Date().toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Plain text body
            const plainBody = `
Kode Verifikasi OTP

Kode verifikasi Anda: ${otp}

Kode ini akan kedaluwarsa dalam ${expiryMinutes} menit.

PENTING: Jangan bagikan kode ini kepada siapapun.

Dikirim pada: ${new Date().toLocaleString('id-ID')}
            `.trim();

            const response = await fetch(this.baseUrl + '/ext/inbox/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emailId: env.emailId,
                    to: to,
                    subject: `🔐 Kode Verifikasi OTP - ${otp}`,
                    htmlBody: htmlBody,
                    plainBody: plainBody,
                    attachments: []
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ OTP berhasil dikirim ke ${to}`);
                return {
                    success: true,
                    message: 'OTP berhasil dikirim',
                    otp_sent: otp,
                    email: to,
                    expires_in_minutes: expiryMinutes,
                    sent_at: new Date(),
                    data: data
                };
            } else {
                const errorData = await response.json();
                throw new Error(`Gagal kirim OTP. Status: ${response.status}. Detail: ${JSON.stringify(errorData)}`);
            }

        } catch (error) {
            throw new Error('Gagal mengirim OTP: ' + error.message);
        }
    }

    // Method untuk generate OTP random
    generateOTP(length = 4) {
        try {
            if (length !== 4) {
                throw new Error('Panjang OTP harus 4 digit');
            }

            const digits = '0123456789';
            let otp = '';

            for (let i = 0; i < length; i++) {
                otp += digits[Math.floor(Math.random() * digits.length)];
            }

            return otp;

        } catch (error) {
            throw new Error('Gagal generate OTP: ' + error.message);
        }
    }

    // Method untuk kirim OTP dengan generate otomatis
    async sendGeneratedOTP({ to, otpLength = 4, expiryMinutes = 5 }) {
        try {

            if (!to) {
                throw new Error("Email tujuan wajib ada");
            }

            // Generate OTP
            const otp = this.generateOTP(4);

            // Kirim OTP ke user
            const result = await this.sendOTP({
                emailId: env.EMAIL_ID,
                to: to,
                otp: otp,
                expiryMinutes: expiryMinutes,
            });

            // Simpan OTP ke database
            const savedOtp = await OtpModel.createOTP(
                to,            // email tujuan
                otp,           // kode otp
                expiryMinutes * 60 // detik
            );

            return {
                status: "success",
                message: "OTP berhasil dikirim dan disimpan",
                otpId: savedOtp.id,
                email: savedOtp.email,
                expiresAt: savedOtp.expires_at,
            };

        } catch (error) {
            throw new Error("Gagal mengirim generated OTP: " + error.message);
        }
    }

    // Method test untuk send OTP
    async testSendOTP() {
        try {
            const result = await this.sendGeneratedOTP({
                emailId: 'test-otp-' + Date.now(),
                to: 'test@example.com',
                otpLength: 6,
                expiryMinutes: 5
            });

            return result;

        } catch (error) {
            throw new Error('Test OTP gagal: ' + error.message);
        }
    }




}


export default new EmailService();