import { NextResponse } from "next/server"

type DemoState = {
  themeVariant: "earthy" | "slate"
  roofPhotoFixed: boolean
  faqFirstQuestion: string
}

const DEFAULT_STATE: DemoState = {
  themeVariant: "earthy",
  roofPhotoFixed: false,
  faqFirstQuestion: "What areas do you serve?",
}

const globalState = globalThis as typeof globalThis & { __demoState?: DemoState }
if (!globalState.__demoState) {
  globalState.__demoState = { ...DEFAULT_STATE }
}

export function getState(): DemoState {
  return globalState.__demoState!
}

export function updateState(partial: Partial<DemoState>): DemoState {
  globalState.__demoState = { ...globalState.__demoState!, ...partial }
  return globalState.__demoState
}

export function resetState(): DemoState {
  globalState.__demoState = { ...DEFAULT_STATE }
  return globalState.__demoState
}

export async function GET() {
  return NextResponse.json(getState(), {
    headers: { "Cache-Control": "no-store" },
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const state = updateState(body)
  console.log("State updated:", state)
  return NextResponse.json(state)
}
