import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            쿠팡 스테이블 캐시
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            XRP Ledger 기반의 안전하고 빠른 스테이블 코인 플랫폼
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-8">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              로그인
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="text-lg px-8">
              회원가입
            </Button>
          </Link>
        </div>

        <div className="pt-12 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">빠른 거래</h3>
            <p className="text-gray-600 text-sm">
              XRP Ledger의 높은 처리 속도로 즉시 거래 가능
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">안전한 보관</h3>
            <p className="text-gray-600 text-sm">
              암호화된 지갑으로 자산을 안전하게 보호
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">간편한 충전</h3>
            <p className="text-gray-600 text-sm">
              쉽고 빠른 토큰 충전 및 거래 내역 조회
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
