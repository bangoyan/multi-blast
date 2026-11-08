import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Kebijakan Privasi - MultiBlast',
  description: 'Kebijakan Privasi MultiBlast untuk penggunaan layanan integrasi media sosial.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#ECEEF1] dark:bg-[#0E1015] p-4 sm:p-8 text-foreground">
      <div className="mx-auto max-w-4xl rounded-[32px] bg-white dark:bg-[#13161C] p-6 sm:p-10 shadow-sm border border-black/5 dark:border-white/5 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-xs font-semibold text-gray-400">Terakhir diperbarui: 8 November 2026</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D8F85D] text-black">
            <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Kebijakan Privasi MultiBlast
            </h1>
            <p className="text-xs font-medium text-gray-500">
              Komitmen kami melindungi data dan akun media sosial Anda.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">1. Pendahuluan</h2>
            <p>
              MultiBlast (&quot;kami&quot;, &quot;layanan&quot;) menghormati privasi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi saat Anda mengintegrasikan akun media sosial (Facebook, Instagram, TikTok, YouTube) dengan platform MultiBlast.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">2. Data yang Kami Kumpulkan</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Informasi Profil Publik:</strong> Nama, username, ID pengguna platform, dan foto profil yang diberikan melalui OAuth resmi.</li>
              <li><strong>Token Akses Terenkripsi:</strong> Token akses OAuth yang diperlukan untuk mempublikasikan postingan terjadwal dan menerima webhook komentar.</li>
              <li><strong>Konten yang Dikelola:</strong> Teks postingan, media URL, serta komentar publik yang masuk ke postingan Anda untuk kebutuhan auto-reply/auto-DM.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">3. Cara Kami Menggunakan Data</h2>
            <p>Data yang dikumpulkan hanya digunakan untuk fungsionalitas inti aplikasi, meliputi:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Menjadwalkan dan mempublikasikan konten ke akun media sosial pilihan Anda.</li>
              <li>Mengotomatiskan balasan komentar dan pesan langsung (DM) berdasarkan aturan yang Anda tetapkan.</li>
              <li>Menampilkan statistik agregat performa akun (views, pengikut, interaksi) di dashboard pribadi Anda.</li>
            </ul>
            <p>Kami <strong>tidak pernah</strong> menjual, menyewakan, atau membagikan data akun media sosial Anda kepada pihak ketiga manapun untuk tujuan periklanan.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">4. Penyimpanan dan Keamanan Data</h2>
            <p>
              Semua token autentikasi disimpan dalam database terenkripsi dengan protokol keamanan industri. Komunikasi data menggunakan enkripsi TLS/HTTPS 256-bit standar.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">5. Hak Pengguna &amp; Penghapusan Data</h2>
            <p>
              Anda memiliki hak penuh untuk memutuskan sambungan akun media sosial kapan saja melalui menu Akun di dashboard MultiBlast. Untuk petunjuk lengkap penghapusan data secara permanen, silakan kunjungi halaman{' '}
              <Link href="/data-deletion" className="font-bold underline text-blue-600 dark:text-blue-400">
                Petunjuk Penghapusan Data
              </Link>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">6. Kontak</h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi tim kami di support@bangoyan.web.id.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
