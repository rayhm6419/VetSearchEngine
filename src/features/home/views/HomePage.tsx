import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import SearchCard from '../components/SearchCard';
import MapPanel from '../components/MapPanel';
import Section from '../components/Section';
import CardArticle from '../components/CardArticle';
import CardPlace from '../components/CardPlace';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFDFB] text-[color:var(--color-text)]">
      <Navbar />
      <main className="pt-[72px]">
        <Hero />
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[1200px] px-6 mt-12">
            <div className="flex gap-8" style={{ height: 420 }}>
              <div className="w-[360px]">
                <SearchCard />
              </div>
              <div className="flex-1">
                <MapPanel />
              </div>
            </div>
          </div>

          <div className="w-full max-w-[1200px] px-6">
            <Section title="Top Rated in Your Area" topMargin={48}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <CardArticle
                  title="Keeping Your Dog Hydrated"
                  meta="4.8, mar1"
                  illustration="dog"
                  background="#FFE9D7"
                />
                <CardArticle
                  title="Introducing a New Puppy to Your Home"
                  meta="15.5 min"
                  illustration="catHouse"
                  background="#E8F4FF"
                />
                <CardPlace
                  title="Greenfield Veterinarian Clinic"
                  reads="48 read"
                  image="https://images.unsplash.com/photo-1558944350-8f6f5e7f8f6f?q=80&w=1200&auto=format&fit=crop"
                />
              </div>
            </Section>

            <Section title="Pet Care & Adoption Tips">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <CardArticle
                  title="Daily Walk Checklist"
                  meta="6 min read"
                  illustration="blueDog"
                  background="#E4F3FF"
                  compact
                />
                <CardArticle
                  title="Setting Up a Cozy Shelter"
                  meta="8 min read"
                  illustration="greenHouse"
                  background="#EAF7E8"
                  compact
                />
                <CardArticle
                  title="Keeping Kittens Curious"
                  meta="4 min read"
                  illustration="orangeCat"
                  background="#FFE9E4"
                  compact
                />
              </div>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
