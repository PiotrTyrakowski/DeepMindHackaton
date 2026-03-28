import { NextResponse } from "next/server"
import { resetState } from "../state/route"

export async function POST() {
  const state = resetState()
  console.log("State reset")
  return NextResponse.json(state)
}
