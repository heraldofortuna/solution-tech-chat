import { FaBeer } from 'react-icons/fa';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function Page() {
  return (
    <div className="flex">
      <aside className="bg-white w-20 h-screen border-r border-gray-200">
        <div className="flex flex-col">

        </div>
      </aside>
      <div className="bg-[#F8FAFC] w-full h-screen flex flex-col">
        <header className="w-full border-b border-gray-200 p-2 md:p-6">
          <div className="flex items-center gap-6">
            <h1 className="text-lg md:text-3xl font-bold leading-10">SolutionTech🤖</h1>
          </div>
        </header>
        <main className="h-full p-6 md:py-8 md:px-24">
          <div className="h-full flex flex-col gap-6">
            <section className="mt-auto mx-0">
              <Textarea />
              <Button size="lg">
                Send <FaBeer />
              </Button>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}