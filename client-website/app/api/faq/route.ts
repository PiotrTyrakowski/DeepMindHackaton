import { NextResponse } from "next/server"
import { getState, updateState } from "../state/route"

export async function POST(req: Request) {
  const body = await req.json()
  const state = updateState({ faqFirstQuestion: body.faqFirstQuestion })
  console.log("FAQ updated:", state.faqFirstQuestion)
  return NextResponse.json(state)
}

export async function GET() {
  return NextResponse.json({ faqFirstQuestion: getState().faqFirstQuestion })
}
