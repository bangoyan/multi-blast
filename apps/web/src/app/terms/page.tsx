import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Ketentuan Layanan - MultiBlast',
  description: 'Ketentuan Layanan dan penggunaan platform automasi media sosial MultiBlast.',
}

export default function TermsPage() {
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
          <span className="text-xs font-semibold text-gray-400">MultiBlast Terms of Service</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600">
            <FileText className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Ketentuan Layanan MultiBlast
            </h1>
            <p className="text-xs font-medium text-gray-500">
              Syarat dan ketentuan penggunaan platform integrasi dan penjadwalan media sosial.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses dan menggunakan MultiBlast, Anda menyetujui untuk terikat oleh Ketentuan Layanan ini serta Kebijakan Privasi kami.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">2. Penggunaan yang Diizinkan</h2>
            <p>
              Anda bertanggung jawab penuh atas semua konten yang Anda jadwalkan dan publikasikan melalui layanan ini. Anda setuju untuk mematuhi kebijakan komunitas dari masing-masing platform media sosial (Meta Community Standards, TikTok Community Guidelines, YouTube Community Guidelines).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">3. Ketersediaan Layanan</h2>
            <p>
              Kami berusaha keras menjaga layanan tetap aktif 24/7, namun tidak bertanggung jawab atas gangguan yang disebabkan oleh pemeliharaan pihak ketiga atau perubahan API oleh penyedia media sosial terkait.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
