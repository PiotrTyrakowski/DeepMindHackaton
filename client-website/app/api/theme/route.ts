import { NextResponse } from "next/server"
import { getState, updateState } from "../state/route"

export async function POST(req: Request) {
  const body = await req.json()
  const state = updateState({ themeVariant: body.themeVariant || "slate" })
  console.log("Theme changed:", state.themeVariant)
  return NextResponse.json(state)
}

export async function GET() {
  return NextResponse.json({ themeVariant: getState().themeVariant })
}
