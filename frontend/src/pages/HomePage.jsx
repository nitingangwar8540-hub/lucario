import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/hero/HeroSection'
import CopilotSection from '../components/copilot/CopilotSection'
import ScholarshipDirectory from '../components/directory/ScholarshipDirectory'
import HowItWorks from '../components/process/HowItWorks'
import TestimonialsSection from '../components/testimonials/TestimonialsSection'
import CtaBanner from '../components/cta/CtaBanner'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          <HeroSection />
          <CopilotSection />
          <ScholarshipDirectory />
          <HowItWorks />
          <TestimonialsSection />
          <CtaBanner />
        </div>
      </main>
      <Footer />
    </>
  )
}
