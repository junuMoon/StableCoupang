"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

interface User {
  id: string
  email: string | null
  name: string | null
  xrpAddress: string
}

interface Balance {
  currency: string
  value: string
  issuer?: string
}

interface Transaction {
  hash: string
  date: string
  type: string
  amount: string
}

export default function DashboardClient({ user }: { user: User }) {
  const [balance, setBalance] = useState<Balance[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isLoadingTx, setIsLoadingTx] = useState(true)
  const [isCharging, setIsCharging] = useState(false)
  const [chargeAmount, setChargeAmount] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchBalance = async () => {
    setIsLoadingBalance(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      const response = await fetch(`${API_URL}/api/wallet/balance/${user.xrpAddress}`)
      const data = await response.json()

      if (data.success) {
        setBalance(data.data.balances || [])
      } else {
        toast.error("잔액 조회 실패")
      }
    } catch (error) {
      toast.error("잔액 조회 중 오류 발생")
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const fetchTransactions = async () => {
    setIsLoadingTx(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      const response = await fetch(`${API_URL}/api/wallet/transactions/${user.xrpAddress}?limit=10`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.data.transactions || [])
      }
    } catch (error) {
      console.error("거래 내역 조회 오류:", error)
    } finally {
      setIsLoadingTx(false)
    }
  }

  useEffect(() => {
    fetchBalance()
    fetchTransactions()
  }, [user.xrpAddress])

  const handleCharge = async () => {
    if (!chargeAmount || parseFloat(chargeAmount) <= 0) {
      toast.error("올바른 금액을 입력하세요")
      return
    }

    setIsCharging(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      const response = await fetch(`${API_URL}/api/token/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          toAddress: user.xrpAddress,
          amount: chargeAmount
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`${chargeAmount} KRW 충전 완료!`)
        setChargeAmount("")
        setDialogOpen(false)
        setTimeout(() => {
          fetchBalance()
          fetchTransactions()
        }, 2000)
      } else {
        toast.error("충전 실패: " + data.message)
      }
    } catch (error) {
      toast.error("충전 중 오류 발생")
    } finally {
      setIsCharging(false)
    }
  }

  const krwBalance = balance.find(b => b.currency === "KRW")?.value || "0"
  const xrpBalance = balance.find(b => b.currency === "XRP")?.value || "0"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">쿠팡 스테이블 캐시</h1>
          <Button variant="outline" onClick={() => signOut()}>
            로그아웃
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>사용자 정보</CardTitle>
              <CardDescription>현재 로그인한 계정 정보</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">이름:</span>{" "}
                <span className="font-medium">{user.name || "미설정"}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">이메일:</span>{" "}
                <span className="font-medium">{user.email}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">XRP 주소:</span>{" "}
                <span className="font-mono text-sm">{user.xrpAddress}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>잔액</CardTitle>
                <CardDescription>현재 보유 중인 자산</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>충전하기</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>KRW 토큰 충전</DialogTitle>
                    <DialogDescription>
                      충전할 금액을 입력하세요
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">충전 금액</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="10000"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        disabled={isCharging}
                      />
                    </div>
                    <Button
                      onClick={handleCharge}
                      className="w-full"
                      disabled={isCharging}
                    >
                      {isCharging ? "충전 중..." : "충전하기"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="text-center py-4 text-gray-500">로딩 중...</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">KRW (스테이블 코인)</div>
                      <div className="text-3xl font-bold text-blue-600">{krwBalance}</div>
                    </div>
                    <div className="text-sm text-gray-500">KRW</div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">XRP (수수료용)</div>
                      <div className="text-2xl font-bold text-gray-700">{parseFloat(xrpBalance).toFixed(2)}</div>
                    </div>
                    <div className="text-sm text-gray-500">XRP</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>거래 내역</CardTitle>
              <CardDescription>최근 거래 내역 (최대 10개)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTx ? (
                <div className="text-center py-4 text-gray-500">로딩 중...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  거래 내역이 없습니다
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>날짜</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead className="text-right">해시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.hash}>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>{tx.type}</TableCell>
                        <TableCell>{tx.amount}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {tx.hash.substring(0, 16)}...
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
