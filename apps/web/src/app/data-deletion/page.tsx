import Link from 'next/link'
import { Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Petunjuk Penghapusan Data Pengguna - MultiBlast',
  description: 'Panduan lengkap cara menghapus data akun media sosial dan akses dari MultiBlast.',
}

export default function DataDeletionPage() {
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
          <span className="text-xs font-semibold text-gray-400">MultiBlast Data Deletion Protocol</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600">
            <Trash2 className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Petunjuk Penghapusan Data Pengguna
            </h1>
            <p className="text-xs font-medium text-gray-500">
              Sesuai dengan ketentuan Platform Meta (Facebook &amp; Instagram) dan regulasi privasi data pengguna.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            MultiBlast menghormati kedaulatan data setiap pengguna. Jika Anda ingin menghapus data akun media sosial Anda dari server kami atau mencabut izin aplikasi, Anda dapat melakukannya dengan 2 metode berikut:
          </p>

          <section className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Metode 1: Menghapus Langsung dari Dashboard MultiBlast (Instan)
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
              <li>Masuk ke akun Anda di <strong>https://multiblast.bangoyan.web.id/login</strong>.</li>
              <li>Buka menu <strong>Accounts</strong> (Saluran Media Sosial).</li>
              <li>Pada kartu platform (Facebook, Instagram, TikTok, atau YouTube), Anda akan melihat daftar akun yang terhubung.</li>
              <li>Klik ikon <strong>Tempat Sampah (Hapus / Putuskan Sambungan)</strong> di samping akun yang ingin dihapus.</li>
              <li>Konfirmasi tindakan Anda. Semua access token, ID, dan metadata akun terkait akan dihapus permanen dari database MultiBlast seketika.</li>
            </ol>
          </section>

          <section className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Metode 2: Mencabut Akses Melalui Akun Facebook / Instagram Anda
            </h2>
            <p className="text-xs sm:text-sm">
              Jika Anda tidak lagi memiliki akses ke aplikasi MultiBlast, Anda dapat mencabut akses dan meminta penghapusan data langsung dari pengaturan Meta:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
              <li>Buka akun Facebook Anda lalu masuk ke <strong>Pengaturan &amp; Privasi</strong> &gt; <strong>Pengaturan</strong>.</li>
              <li>Cari menu <strong>Aplikasi dan Situs Web (Apps and Websites)</strong>.</li>
              <li>Temukan aplikasi <strong>MultiBlast</strong> di daftar aplikasi aktif.</li>
              <li>Klik tombol <strong>Hapus (Remove)</strong>.</li>
              <li>Centang opsi untuk meminta penghapusan postingan, video, atau data interaksi yang dibuat oleh aplikasi jika diinginkan, lalu konfirmasi penghapusan.</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Permintaan Penghapusan Manual</h2>
            <p className="text-xs sm:text-sm">
              Jika Anda memerlukan verifikasi penghapusan data atau ingin seluruh akun Anda dan histori postingan di MultiBlast dibersihkan secara total oleh tim teknis kami, silakan kirimkan email ke:
            </p>
            <p className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 font-mono text-xs font-bold text-gray-800 dark:text-gray-200">
              support@bangoyan.web.id dengan subjek: &quot;Data Deletion Request - [Email Anda]&quot;
            </p>
            <p className="text-xs text-gray-500">
              Permintaan melalui email akan diproses dalam waktu maksimal 2 x 24 jam kerja dan kami akan mengirimkan email konfirmasi setelah seluruh data dibersihkan.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
