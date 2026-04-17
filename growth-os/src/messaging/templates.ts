export interface TemplateVars {
  [key: string]: string | number;
}

/**
 * Renders a template string by replacing {{variable}} placeholders.
 */
export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = vars[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

// ─── Built-in templates ───────────────────────────────────────────────────────

export const BUILTIN_TEMPLATES = {
  // WhatsApp
  booking_confirmation_wa: {
    channel: 'whatsapp' as const,
    body: `Halo {{name}}! 🎉 Booking Anda di {{business_name}} telah dikonfirmasi.\n\n📅 Tanggal: {{date}}\n🕐 Waktu: {{time}}\n💰 Total: Rp {{amount}}\n\nSampai jumpa! Hubungi kami jika ada pertanyaan.`,
  },
  appointment_reminder_wa: {
    channel: 'whatsapp' as const,
    body: `Halo {{name}}! Pengingat: Anda memiliki janji di {{business_name}} besok.\n\n📅 {{date}} pukul {{time}}\n\nKetik BATAL jika ingin membatalkan. Terima kasih!`,
  },
  win_back_wa: {
    channel: 'whatsapp' as const,
    body: `Halo {{name}}, kami kangen kamu! 😊\n\nSudah {{days_since}} hari sejak kunjungan terakhirmu di {{business_name}}.\n\nKhusus untuk kamu, dapatkan diskon {{discount}}% untuk kunjungan berikutnya! Berlaku hingga {{expiry_date}}.\n\nBooking sekarang: {{booking_url}}`,
  },
  payment_receipt_wa: {
    channel: 'whatsapp' as const,
    body: `Terima kasih {{name}}! 🙏\n\nPembayaran Anda sebesar Rp {{amount}} untuk {{service_name}} telah diterima.\n\nNo. Invoice: {{invoice_id}}\nTanggal: {{date}}\n\n{{business_name}}`,
  },
  review_request_wa: {
    channel: 'whatsapp' as const,
    body: `Halo {{name}}! Kami harap pelayanan di {{business_name}} memuaskan 😊\n\nBoleh minta ulasan singkat? Hanya 1 menit:\n{{review_url}}\n\nUlasan Anda sangat berarti bagi kami! 🌟`,
  },

  // Email
  booking_confirmation_email: {
    channel: 'email' as const,
    subject: 'Konfirmasi Booking — {{business_name}}',
    body: `<h2>Booking Dikonfirmasi! 🎉</h2>
<p>Halo <strong>{{name}}</strong>,</p>
<p>Booking Anda di <strong>{{business_name}}</strong> telah berhasil dikonfirmasi.</p>
<table style="border-collapse:collapse;width:100%">
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Tanggal</strong></td><td style="padding:8px;border:1px solid #ddd">{{date}}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Waktu</strong></td><td style="padding:8px;border:1px solid #ddd">{{time}}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Layanan</strong></td><td style="padding:8px;border:1px solid #ddd">{{service_name}}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Total</strong></td><td style="padding:8px;border:1px solid #ddd">Rp {{amount}}</td></tr>
</table>
<p>Sampai jumpa!</p>`,
  },
  win_back_email: {
    channel: 'email' as const,
    subject: 'Kami Kangen Kamu, {{name}}! 💌',
    body: `<h2>Sudah lama tidak berkunjung!</h2>
<p>Halo <strong>{{name}}</strong>,</p>
<p>Sudah <strong>{{days_since}} hari</strong> sejak kunjungan terakhirmu di {{business_name}}.</p>
<p>Khusus untuk kamu, dapatkan <strong>diskon {{discount}}%</strong> untuk kunjungan berikutnya!</p>
<p style="text-align:center">
  <a href="{{booking_url}}" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px">Book Sekarang</a>
</p>
<p><small>Promo berlaku hingga {{expiry_date}}</small></p>`,
  },
} satisfies Record<string, {
  channel: 'whatsapp' | 'email';
  body: string;
  subject?: string;
}>;

export type BuiltinTemplateKey = keyof typeof BUILTIN_TEMPLATES;
