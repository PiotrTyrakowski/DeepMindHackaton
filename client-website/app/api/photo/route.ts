import { NextResponse } from "next/server"
import { getState, updateState } from "../state/route"

export async function POST(req: Request) {
  const body = await req.json()
  const state = updateState({ roofPhotoFixed: body.roofPhotoFixed ?? true })
  console.log("Photo fixed:", state.roofPhotoFixed)
  return NextResponse.json(state)
}

export async function GET() {
  return NextResponse.json({ roofPhotoFixed: getState().roofPhotoFixed })
}
