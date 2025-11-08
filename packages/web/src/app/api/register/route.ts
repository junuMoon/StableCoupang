import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/crypto"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호는 필수입니다" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 존재하는 이메일입니다" },
        { status: 400 }
      )
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

    const walletResponse = await fetch(`${API_URL}/api/wallet/create`, {
      method: "POST"
    })

    if (!walletResponse.ok) {
      throw new Error("지갑 생성에 실패했습니다")
    }

    const walletData = await walletResponse.json()

    if (!walletData.success || !walletData.data) {
      throw new Error("지갑 생성에 실패했습니다")
    }

    const { address, seed } = walletData.data

    const trustLineResponse = await fetch(`${API_URL}/api/token/setup-trustline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userSeed: seed
      })
    })

    if (!trustLineResponse.ok) {
      console.error("Trust Line 설정 실패, 하지만 계속 진행합니다")
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const encryptedSeed = encrypt(seed)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        xrpAddress: address,
        xrpSeed: encryptedSeed
      }
    })

    return NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        xrpAddress: user.xrpAddress
      }
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error.message || "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
