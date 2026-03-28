import { DemoForm } from "./_components/demo-form";

export default function DemoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl">Demo</h1>
        <p className="text-muted-foreground text-sm">
           
        </p>
      </div>
      <div className="flex justify-center">
        <DemoForm />
      </div>
    </div>
  );
}
