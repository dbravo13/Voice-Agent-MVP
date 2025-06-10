import Header from "@/components/Header";
import CategoryNav from "@/components/CategoryNav";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import AIAssistant from "@/components/AIAssistant";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryNav />
      <main>
        <Hero />
        <FeaturedProducts />
        <AIAssistant />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
