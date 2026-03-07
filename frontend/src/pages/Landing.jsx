import HeroSection from '../components/HeroSection'
import HowItWorks from '../components/HowItWorks'
import StatsBar from '../components/StatsBar'
import FeaturesSection from '../components/FeaturesSection'
import PricingSection from '../components/PricingSection'

export default function Landing() {
    return (
        <div className="flex flex-col min-h-screen bg-navy-900">
            <HeroSection />
            <HowItWorks />
            <StatsBar />
            <FeaturesSection />
            <PricingSection />
        </div>
    )
}
